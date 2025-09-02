// Geolocation utility for detecting user's country
export interface GeolocationResult {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
}

// Country code to country name mapping for African countries
const africanCountries: Record<string, string> = {
  'DZ': 'Algeria',
  'AO': 'Angola',
  'BJ': 'Benin',
  'BW': 'Botswana',
  'BF': 'Burkina Faso',
  'BI': 'Burundi',
  'CM': 'Cameroon',
  'CV': 'Cape Verde',
  'CF': 'Central African Republic',
  'TD': 'Chad',
  'KM': 'Comoros',
  'CG': 'Congo',
  'CD': 'Democratic Republic of the Congo',
  'CI': 'Ivory Coast',
  'DJ': 'Djibouti',
  'EG': 'Egypt',
  'GQ': 'Equatorial Guinea',
  'ER': 'Eritrea',
  'ET': 'Ethiopia',
  'GA': 'Gabon',
  'GM': 'Gambia',
  'GH': 'Ghana',
  'GN': 'Guinea',
  'GW': 'Guinea-Bissau',
  'KE': 'Kenya',
  'LS': 'Lesotho',
  'LR': 'Liberia',
  'LY': 'Libya',
  'MG': 'Madagascar',
  'MW': 'Malawi',
  'ML': 'Mali',
  'MR': 'Mauritania',
  'MU': 'Mauritius',
  'MA': 'Morocco',
  'MZ': 'Mozambique',
  'NA': 'Namibia',
  'NE': 'Niger',
  'NG': 'Nigeria',
  'RW': 'Rwanda',
  'ST': 'São Tomé and Príncipe',
  'SN': 'Senegal',
  'SC': 'Seychelles',
  'SL': 'Sierra Leone',
  'SO': 'Somalia',
  'ZA': 'South Africa',
  'SS': 'South Sudan',
  'SD': 'Sudan',
  'SZ': 'Eswatini',
  'TZ': 'Tanzania',
  'TG': 'Togo',
  'TN': 'Tunisia',
  'UG': 'Uganda',
  'ZM': 'Zambia',
  'ZW': 'Zimbabwe',
};

export const getCurrentLocation = (): Promise<GeolocationResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, falling back to IP detection');
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    console.log('Attempting to get current location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('Got coordinates:', { latitude, longitude });
          
          // Use a free geocoding service to get country information
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch location data');
          }
          
          const data = await response.json();
          console.log('Geocoding response:', data);
          
          const countryCode = data.countryCode;
          const country = africanCountries[countryCode] || data.countryName || 'Nigeria';
          
          console.log('Detected country:', country, 'Code:', countryCode);
          
          resolve({
            country,
            countryCode,
            city: data.city,
            region: data.principalSubdivision,
          });
        } catch (error) {
          console.error('Error fetching location data:', error);
          // Fallback to Nigeria if geocoding fails
          resolve({
            country: 'Nigeria',
            countryCode: 'NG',
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback to Nigeria if geolocation fails
        resolve({
          country: 'Nigeria',
          countryCode: 'NG',
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 15000, // Increased timeout
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

export const getCountryFromIP = async (): Promise<GeolocationResult> => {
  try {
    console.log('Attempting IP-based geolocation...');
    // Use a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch IP location data');
    }
    
    const data = await response.json();
    console.log('IP geolocation response:', data);
    
    const countryCode = data.country_code;
    const country = africanCountries[countryCode] || data.country_name || 'Nigeria';
    
    console.log('IP detected country:', country, 'Code:', countryCode);
    
    return {
      country,
      countryCode,
      city: data.city,
      region: data.region,
    };
  } catch (error) {
    console.error('Error fetching IP location data:', error);
    // Fallback to Nigeria if IP geolocation fails
    return {
      country: 'Nigeria',
      countryCode: 'NG',
    };
  }
};

// Main function to get user's country with fallbacks
export const getUserCountry = async (): Promise<string> => {
  console.log('Starting country detection...');
  
  try {
    // Try geolocation first
    console.log('Trying geolocation...');
    const location = await getCurrentLocation();
    console.log('Geolocation successful:', location.country);
    return location.country;
  } catch (error) {
    console.log('Geolocation failed, trying IP-based detection...');
    try {
      // Fallback to IP-based geolocation
      const location = await getCountryFromIP();
      console.log('IP-based detection successful:', location.country);
      return location.country;
    } catch (error) {
      console.log('All detection methods failed, using fallback: Nigeria');
      // Final fallback
      return 'Nigeria';
    }
  }
};
