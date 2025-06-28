import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
  ) {}

  generateAccessToken(data: Record<string, any>) {
    return this.jwtService.sign(data, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });
  }

  async validateUser(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const admin = await this.adminService.findOne(email);

    if (!admin) {
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect email');
    }

    return admin;
  }

  async login(admin: any) {
    return {
      admin,
      accessToken: this.generateAccessToken({
        sub: admin._id.toString(),
      }),
      message: 'Login successful',
    };
  }
}
