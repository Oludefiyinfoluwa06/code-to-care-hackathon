import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { AvailableDaysAndTime, Doctor } from '../../schemas/doctor.schema';

@Injectable()
export class DoctorService {
  constructor(@InjectModel(Doctor.name) private doctorModel: Model<Doctor>) {}

  private parseCsv(buffer: Buffer) {
    return new Promise((resolve, reject) => {
      const results: any = [];
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csvParser())
        .on('data', (row) => {
          const daysRaw = row['days'] || '';
          const timeRaw = row['time'] || '';
          const days = daysRaw
            .split(';')
            .map((s: string) => s.trim())
            .filter(Boolean);
          const times = timeRaw
            .split(';')
            .map((s: string) => s.trim())
            .filter(Boolean);

          const availableDaysAndTime: AvailableDaysAndTime[] = [];
          days.forEach((day: string, index: number) => {
            const time = times[index] || '';
            availableDaysAndTime.push({ day, time });
          });

          results.push({
            name: row['name'],
            email: row['email'],
            phone: row['phone'],
            availableDaysAndTime,
          });
        })
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  async create(createDoctorDto: CreateDoctorDto) {
    const { name, email, phone, availableDaysAndTime } = createDoctorDto;

    const existingDoctor = await this.findOne({ email, phone });

    if (existingDoctor) {
      throw new ConflictException(
        'A doctor with the same email or phone exists already',
      );
    }

    const doctor = await this.doctorModel.create({
      name,
      email,
      phone,
      availableDaysAndTime,
    });

    return {
      message: 'Doctor created successfully',
      doctor,
    };
  }

  async bulkCreation(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const ext = file.originalname.split('.').pop().toLowerCase();
    let docs: any = [];

    if (ext === 'json') {
      try {
        const data = JSON.parse(file.buffer.toString());
        docs = Array.isArray(data) ? data : [data];
      } catch (err) {
        throw new BadRequestException('Invalid JSON file');
      }
    } else if (ext === 'csv') {
      docs = await this.parseCsv(file.buffer);
    } else {
      throw new BadRequestException('Unsupported file type');
    }

    const existingDocs = await this.doctorModel.find({
      $or: docs.map((doc: any) => ({ email: doc.email, phone: doc.phone })),
    });

    const existingSet = new Set(
      existingDocs.map((doc: any) => `${doc.email}|${doc.phone}`),
    );

    const filteredDocs = docs.filter(
      (doc: any) => !existingSet.has(`${doc.email}|${doc.phone}`),
    );

    const inserted = await this.doctorModel.insertMany(filteredDocs);
    return {
      message:
        `${inserted.length} doctors uploaded successfully` +
        (docs.length > inserted.length
          ? ` (${docs.length - inserted.length} skipped due to duplicates)`
          : ''),
      doctors: inserted,
    };
  }

  async findAll() {
    return await this.doctorModel.find();
  }

  async findOne({ email, phone }: { email?: string; phone?: string }) {
    return await this.doctorModel.findOne({
      $or: [{ email }, { phone }],
    });
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.doctorModel.findByIdAndUpdate(
      id,
      updateDoctorDto,
      { new: true },
    );

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      message: 'Doctor updated successfully',
      doctor,
    };
  }

  async remove(id: string) {
    const doctor = await this.doctorModel.findByIdAndDelete(id);

    return {
      message: 'Doctor deleted successfully',
      doctor,
    };
  }
}
