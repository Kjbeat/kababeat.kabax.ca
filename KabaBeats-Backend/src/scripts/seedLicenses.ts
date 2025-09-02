import { connectDatabase } from '@/config/database';
import { License } from '@/modules/license/license.model';
import { logger } from '@/config/logger';

const licenses = [
  {
    name: 'Free Download',
    type: 'FREE',
    description: 'Download for personal use only. No commercial rights included.',
    price: 0,
    features: [
      'MP3 Download',
      'Personal Use Only',
      'Tagged Version',
      'No Commercial Rights'
    ],
    usageRights: 'Personal use only. Cannot be used for commercial purposes, streaming, or public performance.',
    restrictions: [
      'No commercial use',
      'No streaming platforms',
      'No public performance',
      'Must credit producer'
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'MP3 License',
    type: 'MP3',
    description: 'High-quality MP3 download with basic commercial rights.',
    price: 0, // Will be calculated based on beat price
    features: [
      'High-Quality MP3 Download',
      'Commercial Use',
      'Streaming Rights',
      'Untagged Version',
      'Up to 5,000 copies'
    ],
    usageRights: 'Commercial use allowed for up to 5,000 copies. Streaming on platforms allowed. Public performance permitted.',
    restrictions: [
      'Limited to 5,000 copies',
      'No exclusive rights',
      'Must credit producer'
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'WAV License',
    type: 'WAV',
    description: 'Uncompressed WAV file with extended commercial rights.',
    price: 0, // Will be calculated based on beat price + premium
    features: [
      'Uncompressed WAV Download',
      'Commercial Use',
      'Streaming Rights',
      'Untagged Version',
      'Up to 10,000 copies',
      'Higher Quality Audio'
    ],
    usageRights: 'Commercial use allowed for up to 10,000 copies. Streaming on platforms allowed. Public performance permitted.',
    restrictions: [
      'Limited to 10,000 copies',
      'No exclusive rights',
      'Must credit producer'
    ],
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Stems License',
    type: 'STEMS',
    description: 'Individual track stems with full commercial rights.',
    price: 0, // Will be calculated based on beat price + premium
    features: [
      'Individual Track Stems',
      'Full Commercial Use',
      'Streaming Rights',
      'Untagged Version',
      'Unlimited Copies',
      'Sync Rights Included'
    ],
    usageRights: 'Full commercial use with unlimited copies. Streaming, sync, and public performance rights included.',
    restrictions: [
      'No exclusive rights',
      'Must credit producer'
    ],
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Exclusive License',
    type: 'EXCLUSIVE',
    description: 'Exclusive ownership with full rights and custom production.',
    price: 0, // Will be calculated based on beat price + premium
    features: [
      'Exclusive Ownership',
      'Full Commercial Rights',
      'All File Formats',
      'Custom Production',
      'Unlimited Copies',
      'No Tagging Required',
      'Full Sync Rights'
    ],
    usageRights: 'Exclusive ownership with full commercial rights. No restrictions on usage, copies, or distribution.',
    restrictions: [
      'Producer cannot sell to others',
      'Must credit producer'
    ],
    isActive: true,
    sortOrder: 5
  }
];

async function seedLicenses() {
  try {
    await connectDatabase();
    
    // Clear existing licenses
    await License.deleteMany({});
    logger.info('Cleared existing licenses');
    
    // Insert new licenses
    await License.insertMany(licenses);
    logger.info(`Seeded ${licenses.length} licenses successfully`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding licenses:', error);
    process.exit(1);
  }
}

// Run the seed function
seedLicenses();
