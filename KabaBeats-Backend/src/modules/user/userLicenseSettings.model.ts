import mongoose, { Document, Schema } from 'mongoose';

export interface IUserLicenseSettings extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Instance methods
  updateLicenseType(licenseType: string, updates: any): Promise<IUserLicenseSettings>;
  
  // License type configurations
  mp3: {
    enabled: boolean;
    price: number;
    territory: string;
    streamLimit: number;
    saleLimit: number;
    distribution: boolean;
    videos: boolean;
    radio: boolean;
    live: boolean;
  };
  
  wav: {
    enabled: boolean;
    price: number;
    territory: string;
    streamLimit: number;
    saleLimit: number;
    distribution: boolean;
    videos: boolean;
    radio: boolean;
    live: boolean;
  };
  
  trackout: {
    enabled: boolean;
    price: number;
    territory: string;
    streamLimit: number;
    saleLimit: number;
    distribution: boolean;
    videos: boolean;
    radio: boolean;
    live: boolean;
  };
  
  unlimited: {
    enabled: boolean;
    price: number;
    territory: string;
    streamLimit: number;
    saleLimit: number;
    distribution: boolean;
    videos: boolean;
    radio: boolean;
    live: boolean;
  };
  
  exclusive: {
    enabled: boolean;
    price: number;
    territory: string;
    streamLimit: number;
    saleLimit: number;
    distribution: boolean;
    videos: boolean;
    radio: boolean;
    live: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserLicenseSettingsSchema = new Schema<IUserLicenseSettings>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  mp3: {
    enabled: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 25,
      min: 0,
      max: 10000
    },
    territory: {
      type: String,
      default: 'worldwide',
      enum: ['worldwide', 'us-only', 'north-america', 'europe', 'custom']
    },
    streamLimit: {
      type: Number,
      default: 50000,
      min: -1 // -1 means unlimited
    },
    saleLimit: {
      type: Number,
      default: 5000,
      min: -1 // -1 means unlimited
    },
    distribution: {
      type: Boolean,
      default: true
    },
    videos: {
      type: Boolean,
      default: true
    },
    radio: {
      type: Boolean,
      default: false
    },
    live: {
      type: Boolean,
      default: true
    }
  },
  
  wav: {
    enabled: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 45,
      min: 0,
      max: 10000
    },
    territory: {
      type: String,
      default: 'worldwide',
      enum: ['worldwide', 'us-only', 'north-america', 'europe', 'custom']
    },
    streamLimit: {
      type: Number,
      default: 100000,
      min: -1
    },
    saleLimit: {
      type: Number,
      default: 10000,
      min: -1
    },
    distribution: {
      type: Boolean,
      default: true
    },
    videos: {
      type: Boolean,
      default: true
    },
    radio: {
      type: Boolean,
      default: true
    },
    live: {
      type: Boolean,
      default: true
    }
  },
  
  trackout: {
    enabled: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 149,
      min: 0,
      max: 10000
    },
    territory: {
      type: String,
      default: 'worldwide',
      enum: ['worldwide', 'us-only', 'north-america', 'europe', 'custom']
    },
    streamLimit: {
      type: Number,
      default: 500000,
      min: -1
    },
    saleLimit: {
      type: Number,
      default: 50000,
      min: -1
    },
    distribution: {
      type: Boolean,
      default: true
    },
    videos: {
      type: Boolean,
      default: true
    },
    radio: {
      type: Boolean,
      default: true
    },
    live: {
      type: Boolean,
      default: true
    }
  },
  
  unlimited: {
    enabled: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      default: 299,
      min: 0,
      max: 10000
    },
    territory: {
      type: String,
      default: 'worldwide',
      enum: ['worldwide', 'us-only', 'north-america', 'europe', 'custom']
    },
    streamLimit: {
      type: Number,
      default: -1,
      min: -1
    },
    saleLimit: {
      type: Number,
      default: -1,
      min: -1
    },
    distribution: {
      type: Boolean,
      default: true
    },
    videos: {
      type: Boolean,
      default: true
    },
    radio: {
      type: Boolean,
      default: true
    },
    live: {
      type: Boolean,
      default: true
    }
  },
  
  exclusive: {
    enabled: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 2999,
      min: 0,
      max: 10000
    },
    territory: {
      type: String,
      default: 'worldwide',
      enum: ['worldwide', 'us-only', 'north-america', 'europe', 'custom']
    },
    streamLimit: {
      type: Number,
      default: -1,
      min: -1
    },
    saleLimit: {
      type: Number,
      default: -1,
      min: -1
    },
    distribution: {
      type: Boolean,
      default: true
    },
    videos: {
      type: Boolean,
      default: true
    },
    radio: {
      type: Boolean,
      default: true
    },
    live: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for user lookup (already created by unique: true on userId field)

// Define the interface for static methods
interface IUserLicenseSettingsModel extends mongoose.Model<IUserLicenseSettings> {
  getOrCreateUserSettings(userId: string): Promise<IUserLicenseSettings>;
}

// Static method to get or create user license settings
UserLicenseSettingsSchema.statics.getOrCreateUserSettings = async function(userId: string) {
  let settings = await this.findOne({ userId });
  
  if (!settings) {
    settings = new this({ userId });
    await settings.save();
  }
  
  return settings;
};

// Method to update license type settings
UserLicenseSettingsSchema.methods.updateLicenseType = function(licenseType: string, updates: any) {
  if (this[licenseType]) {
    Object.assign(this[licenseType], updates);
  }
  return this.save();
};

export const UserLicenseSettings = mongoose.model<IUserLicenseSettings, IUserLicenseSettingsModel>('UserLicenseSettings', UserLicenseSettingsSchema);
