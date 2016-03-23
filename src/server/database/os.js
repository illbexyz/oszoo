import mongoose, { Schema } from 'mongoose';

const osSchema = new Schema({
  title: String,
  consoleTitle: String,
  memory: Number,
  arch: String,
  diskImage: String,
  cdrom: String,
  description: String,
});

const os = mongoose.model('Os', osSchema);

export default os;
