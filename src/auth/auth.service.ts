import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    accessToken: string;
    user: Partial<User>;
  }> {
    // Check if email already exists
    const existingEmail = await this.usersService.findOneByEmail(
      registerDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.usersService.findOneByUsername(
      registerDto.username,
    );
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    // Generate JWT token
    const accessToken = this.generateToken(user);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    user: Partial<User>;
  }> {
    // Find user by email
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = this.generateToken(user);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async getProfile(userId: string): Promise<Partial<User> | undefined> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return undefined;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });
  }
}
