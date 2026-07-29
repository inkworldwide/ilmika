import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cityLocalities: Record<string, string[]> = {
  "Mumbai": [
    "Andheri West", "Andheri East", "Bandra West", "Bandra East", "Juhu", 
    "Powai", "Goregaon", "Malad", "Kandivali", "Borivali", 
    "South Mumbai", "Colaba", "Lower Parel", "Worli", "Dadar"
  ],
  "Delhi": [
    "Connaught Place", "South Extension", "Vasant Kunj", "Hauz Khas", 
    "Greater Kailash", "Dwarka", "Rohini", "Janakpuri", "Lajpat Nagar", 
    "Karol Bagh", "Saket", " डिफेंस कालोनी (Defence Colony)", "Mayur Vihar", "Pitampura", "Rajouri Garden"
  ],
  "Hyderabad": [
    "Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli", "Madhapur",
    "Kondapur", "Kukatpally", "Begumpet", "Secunderabad", "Ameerpet",
    "Manikonda", "Miyapur", "Tolichowki", "Dilsukhnagar", "LB Nagar"
  ],
  "Chennai": [
    "Adyar", "Besant Nagar", "T Nagar", "Alwarpet", "Mylapore",
    "Anna Nagar", "Velachery", "Thiruvanmiyur", "Nungambakkam", "Guindy",
    "OMR", "ECR", "Tambaram", "Porur", "Chromepet"
  ],
  "Pune": [
    "Koregaon Park", "Kalyani Nagar", "Viman Nagar", "Baner", "Aundh",
    "Hinjewadi", "Wakad", "Kothrud", "Shivajinagar", "Magarpatta",
    "Hadapsar", "Pimple Saudagar", "Bavdhan", "Kharadi", "Deccan Gymkhana"
  ],
  "Kolkata": [
    "Salt Lake", "New Town", "Ballygunge", "Alipore", "Park Street",
    "Rajarhat", "Jadavpur", "Gariahat", "Bhowanipore", "Dum Dum",
    "Tollygunge", "Ruby", "Kasba", "Behala", "New Alipore"
  ],
  "Ahmedabad": [
    "SG Highway", "Bopal", "Satellite", "Vastrapur", "Bodakdev",
    "Prahlad Nagar", "Thaltej", "Navrangpura", "Maninagar", "Chandkheda",
    "Gota", "Vastral", "Naroda", "Makarba", "Paldi"
  ],
  "Gurugram": [
    "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5",
    "Golf Course Road", "Sohna Road", "MG Road", "Sector 56", "Sector 45",
    "Sector 15", "Palam Vihar", "Sushant Lok", "South City", "Sector 50"
  ],
  "Noida": [
    "Sector 15", "Sector 18", "Sector 62", "Sector 137", "Sector 150",
    "Sector 44", "Sector 50", "Sector 93", "Sector 75", "Sector 76",
    "Sector 121", "Sector 143", "Sector 100", "Sector 104", "Sector 135"
  ],
  "Kochi": [
    "Kakkanad", "Edappally", "Palarivattom", "Vyttila", "Panampilly Nagar",
    "Kadavanthra", "Marine Drive", "Fort Kochi", "Kaloor", "Aluva",
    "Tripunithura", "Ernakulam South", "Ernakulam North", "Thripunithura", "Kalamassery"
  ]
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
};

async function main() {
  for (const [cityName, localities] of Object.entries(cityLocalities)) {
    const city = await prisma.city.findFirst({
      where: { name: { equals: cityName, mode: 'insensitive' } }
    });

    if (!city) {
      console.log(`City ${cityName} not found, skipping.`);
      continue;
    }

    let addedCount = 0;
    for (const loc of localities) {
      const slug = slugify(`${city.slug}-${loc}`);
      
      const existing = await prisma.locality.findFirst({
        where: { name: loc, cityId: city.id }
      });

      if (!existing) {
        await prisma.locality.create({
          data: {
            name: loc,
            slug: slug,
            cityId: city.id
          }
        });
        addedCount++;
      }
    }
    console.log(`Added ${addedCount} localities to ${cityName}.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
