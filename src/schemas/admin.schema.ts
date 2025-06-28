import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Admin extends Document {
  @Prop()
  name: string;

  @Prop({ set: (value: string) => value.toLowerCase() })
  email: string;

  @Prop()
  password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
