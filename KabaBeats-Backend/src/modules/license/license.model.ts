import mongoose, { Document, Schema } from 'mongoose';

export interface ILicense extends Document {
  name: string;
  type: 'FREE' | 'MP3' | 'WAV' | 'STEMS' | 'EXCLUSIVE';
  description: string;
  price: number;
  features: string[];
  usageRights: string;
  restrictions: string[];
  isActive: boolean;
  sortOrder: number;
  
  // Methods
  calculatePrice(beatBasePrice: number): number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const LicenseSchema = new Schema<ILicense>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  type: {
    type: String,
    required: true,
    enum: ['FREE', 'MP3', 'WAV', 'STEMS', 'EXCLUSIVE'],
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 10000
  },
  features: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  usageRights: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  restrictions: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for sorting
LicenseSchema.index({ sortOrder: 1, type: 1 });

// Static method to get active licenses
LicenseSchema.statics.getActiveLicenses = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1 });
};

// Static method to get license by type
LicenseSchema.statics.getByType = function(type: string) {
  return this.findOne({ type, isActive: true });
};

// Method to calculate price for a beat
LicenseSchema.methods.calculatePrice = function(beatBasePrice: number) {
  if (this.type === 'FREE') return 0;
  if (this.type === 'MP3') return beatBasePrice;
  if (this.type === 'WAV') return beatBasePrice + 10;
  if (this.type === 'STEMS') return beatBasePrice + 50;
  if (this.type === 'EXCLUSIVE') return beatBasePrice + 200;
  return this.price;
};

export const License = mongoose.model<ILicense>('License', LicenseSchema);
