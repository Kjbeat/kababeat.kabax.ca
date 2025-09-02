/**
 * Utility functions for handling license settings
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface LicenseSetting {
  enabled: boolean;
  price: number;
  territory: string;
  streamLimit: number;
  saleLimit: number;
  distribution: boolean;
  videos: boolean;
  radio: boolean;
  live: boolean;
}

export interface UserLicenseSettings {
  _id: string;
  userId: string;
  mp3: LicenseSetting;
  wav: LicenseSetting;
  trackout: LicenseSetting;
  unlimited: LicenseSetting;
  exclusive: LicenseSetting;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch user license settings by user ID
 * @param userId - The user ID
 * @returns Promise with user license settings or null
 */
export const fetchUserLicenseSettings = async (userId: string): Promise<UserLicenseSettings | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user-license-settings/user/${userId}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching user license settings:', error);
    return null;
  }
};

/**
 * Convert user license settings to license options for beat cards
 * @param settings - User license settings
 * @param basePrice - Beat's base price
 * @returns Array of license options
 */
export const convertToLicenseOptions = (settings: UserLicenseSettings | null, basePrice: number) => {
  if (!settings) {
    // Fallback to default options if no settings found
    return [
      { value: "FREE", label: "Free Download", price: 0, description: "Tagged MP3 for preview / non‑profit use." },
      { value: "MP3", label: "MP3", price: basePrice, description: "Untagged MP3. 2.5k stream allowance." },
      { value: "WAV", label: "WAV", price: basePrice + 10, description: "Untagged WAV + MP3. 10k streams + monetized YouTube." },
      { value: "STEMS", label: "Stems", price: basePrice + 50, description: "Trackout stems + WAV + MP3. 100k streams & live shows." },
      { value: "EXCLUSIVE", label: "Exclusive", price: basePrice + 200, description: "Full rights transfer. Unlimited use." },
    ];
  }

  const options = [];

  // Always include FREE option
  options.push({
    value: "FREE",
    label: "Free Download",
    price: 0,
    description: "Tagged MP3 for preview / non‑profit use."
  });

  // Add enabled license types from user settings
  if (settings.mp3.enabled) {
    options.push({
      value: "MP3",
      label: "MP3",
      price: settings.mp3.price,
      description: `Untagged MP3. ${settings.mp3.streamLimit === -1 ? 'Unlimited' : settings.mp3.streamLimit.toLocaleString()} streams.`
    });
  }

  if (settings.wav.enabled) {
    options.push({
      value: "WAV",
      label: "WAV",
      price: settings.wav.price,
      description: `Untagged WAV + MP3. ${settings.wav.streamLimit === -1 ? 'Unlimited' : settings.wav.streamLimit.toLocaleString()} streams.`
    });
  }

  if (settings.trackout.enabled) {
    options.push({
      value: "STEMS",
      label: "Stems",
      price: settings.trackout.price,
      description: `Trackout stems + WAV + MP3. ${settings.trackout.streamLimit === -1 ? 'Unlimited' : settings.trackout.streamLimit.toLocaleString()} streams.`
    });
  }

  if (settings.unlimited.enabled) {
    options.push({
      value: "UNLIMITED",
      label: "Unlimited",
      price: settings.unlimited.price,
      description: "Unlimited streams & sales. Full commercial rights."
    });
  }

  if (settings.exclusive.enabled) {
    options.push({
      value: "EXCLUSIVE",
      label: "Exclusive",
      price: settings.exclusive.price,
      description: "Full rights transfer. Unlimited use. Beat removed from store."
    });
  }

  return options;
};

/**
 * Get license details for a specific license type
 * @param settings - User license settings
 * @param licenseType - License type
 * @returns Array of license details
 */
export const getLicenseDetails = (settings: UserLicenseSettings | null, licenseType: string): string[] => {
  if (!settings) {
    // Fallback details
    const fallbackDetails: Record<string, string[]> = {
      FREE: ["Tagged MP3 only", "Personal listening / preview", "No monetization", "Credit required"],
      MP3: ["Untagged MP3", "Up to 2,500 streams", "Non-profit use (YouTube demonetized)", "Credit required"],
      WAV: ["Untagged WAV + MP3", "Up to 10,000 streams", "Monetized YouTube allowed", "Live performances (small venues)"],
      STEMS: ["Trackout stems + WAV + MP3", "Up to 100,000 streams", "Broadcast / shows", "Mix & rearrange stems"],
      EXCLUSIVE: ["Unlimited streams & sales", "Full commercial rights", "No further licensing", "Beat removed from store"],
    };
    return fallbackDetails[licenseType] || [];
  }

  const details: string[] = [];
  
  switch (licenseType) {
    case "FREE":
      return ["Tagged MP3 only", "Personal listening / preview", "No monetization", "Credit required"];
    
    case "MP3":
      details.push("Untagged MP3");
      details.push(`${settings.mp3.streamLimit === -1 ? 'Unlimited' : settings.mp3.streamLimit.toLocaleString()} streams`);
      details.push(settings.mp3.distribution ? "Distribution allowed" : "No distribution");
      details.push(settings.mp3.videos ? "Videos allowed" : "No videos");
      details.push(settings.mp3.radio ? "Radio allowed" : "No radio");
      details.push(settings.mp3.live ? "Live performances allowed" : "No live performances");
      break;
    
    case "WAV":
      details.push("Untagged WAV + MP3");
      details.push(`${settings.wav.streamLimit === -1 ? 'Unlimited' : settings.wav.streamLimit.toLocaleString()} streams`);
      details.push(settings.wav.distribution ? "Distribution allowed" : "No distribution");
      details.push(settings.wav.videos ? "Videos allowed" : "No videos");
      details.push(settings.wav.radio ? "Radio allowed" : "No radio");
      details.push(settings.wav.live ? "Live performances allowed" : "No live performances");
      break;
    
    case "STEMS":
      details.push("Trackout stems + WAV + MP3");
      details.push(`${settings.trackout.streamLimit === -1 ? 'Unlimited' : settings.trackout.streamLimit.toLocaleString()} streams`);
      details.push(settings.trackout.distribution ? "Distribution allowed" : "No distribution");
      details.push(settings.trackout.videos ? "Videos allowed" : "No videos");
      details.push(settings.trackout.radio ? "Radio allowed" : "No radio");
      details.push(settings.trackout.live ? "Live performances allowed" : "No live performances");
      break;
    
    case "UNLIMITED":
      details.push("Unlimited streams & sales");
      details.push("Full commercial rights");
      details.push("All territories");
      details.push("No restrictions");
      break;
    
    case "EXCLUSIVE":
      details.push("Unlimited streams & sales");
      details.push("Full commercial rights");
      details.push("No further licensing");
      details.push("Beat removed from store");
      break;
  }
  
  return details;
};
