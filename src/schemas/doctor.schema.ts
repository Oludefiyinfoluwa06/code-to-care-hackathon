import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvailableDaysAndTime = {
  day: string;
  time: string;
};

@Schema()
export class Doctor extends Document {
  @Prop()
  name: string;

  @Prop({ set: (value: string) => value.toLowerCase() })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  availableDaysAndTime: AvailableDaysAndTime[];
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
