import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../../schemas/admin.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
  ) {}

  async findOne(email: string) {
    return await this.adminModel.findOne({ email });
  }

  async findById(id: string) {
    return await this.adminModel.findById(id);
  }
}
