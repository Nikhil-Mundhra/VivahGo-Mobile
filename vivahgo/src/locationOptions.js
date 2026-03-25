export const POPULAR_WEDDING_LOCATIONS = {
  India: {
    "Goa": ["North Goa", "South Goa", "Candolim", "Panaji"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jaisalmer", "Jodhpur", "Pushkar"],
    "Delhi NCR": ["New Delhi", "Gurgaon", "Noida", "Faridabad", "Ghaziabad"],
    "Maharashtra": ["Mumbai", "Pune", "Mahabaleshwar", "Nashik", "Nagpur"],
    "Andhra Pradesh": ["Guntur", "Tirupati", "Vijayawada", "Visakhapatnam"],
    "Assam": ["Dibrugarh", "Guwahati", "Silchar"],
    "Bihar": ["Bhagalpur", "Gaya", "Muzaffarpur", "Patna"],
    "Chhattisgarh": ["Bhilai", "Bilaspur", "Raipur"],
    "Gujarat": ["Ahmedabad", "Rajkot", "Surat", "Vadodara"],
    "Haryana": ["Ambala", "Karnal", "Panipat", "Rohtak"],
    "Himachal Pradesh": ["Dharamshala", "Manali", "Shimla"],
    "Jammu & Kashmir": ["Jammu", "Srinagar"],
    "Jharkhand": ["Dhanbad", "Jamshedpur", "Ranchi"],
    "Karnataka": ["Bengaluru", "Hubli-Dharwad", "Mangaluru", "Mysuru"],
    "Kerala": ["Alleppey", "Kochi", "Kozhikode", "Munnar", "Thiruvananthapuram"],
    "Madhya Pradesh": ["Bhopal", "Gwalior", "Indore", "Jabalpur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Puri"],
    "Punjab": ["Amritsar", "Chandigarh", "Jalandhar", "Ludhiana", "Patiala"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Telangana": ["Hyderabad", "Nizamabad", "Warangal"],
    "Uttar Pradesh": ["Agra", "Kanpur", "Lucknow", "Prayagraj", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haldwani", "Mussoorie", "Nainital", "Rishikesh"],
    "West Bengal": ["Durgapur", "Howrah", "Kolkata", "Siliguri"],
    "Other": ["Other City"],
  },
  UAE: {
    Dubai: ["Dubai"],
    "Abu Dhabi": ["Abu Dhabi"],
    Sharjah: ["Sharjah"],
    Ajman: ["Ajman"],
    "Ras Al Khaimah": ["Ras Al Khaimah"],
    Fujairah: ["Fujairah"],
    "Umm Al Quwain": ["Umm Al Quwain"],
  },
  USA: {
    California: ["San Francisco", "Los Angeles", "San Diego"],
    "New Jersey": ["Edison", "Jersey City"],
    Texas: ["Dallas", "Houston", "Austin"],
  },
  UK: {
    England: ["London", "Leicester", "Birmingham"],
    Scotland: ["Glasgow", "Edinburgh"],
  },
  Canada: {
    Ontario: ["Toronto", "Brampton", "Mississauga"],
    "British Columbia": ["Vancouver", "Surrey"],
    Alberta: ["Calgary", "Edmonton"],
  },
  Australia: {
    NSW: ["Sydney", "Parramatta"],
    Victoria: ["Melbourne", "Geelong"],
    Queensland: ["Brisbane", "Gold Coast"],
  },
  Singapore: {
    Singapore: ["Singapore"],
  },
};

export function getLocationCountries() {
  return Object.keys(POPULAR_WEDDING_LOCATIONS);
}

export function getLocationStates(country) {
  if (!country) {
    return [];
  }
  return Object.keys(POPULAR_WEDDING_LOCATIONS[country] || {});
}

export function getLocationCities(country, state) {
  if (!country || !state) {
    return [];
  }
  return POPULAR_WEDDING_LOCATIONS[country]?.[state] || [];
}

export function formatCoverageLocation(location) {
  if (!location || typeof location !== "object") {
    return "";
  }
  return [location.city, location.state, location.country].filter(Boolean).join(", ");
}
