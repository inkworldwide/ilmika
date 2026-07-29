import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cityLocalities: Record<string, string[]> = {
  "Mumbai": [
    "Andheri West", "Andheri East", "Bandra West", "Bandra East", "Juhu", 
    "Worli", "Powai", "Borivali", "Chembur", "Colaba", "Malad", "Thane", 
    "Mulund", "Khar", "Santa Cruz"
  ],
  "Delhi": [
    "Dwarka", "Saket", "Vasant Kunj", "Karol Bagh", "Connaught Place", 
    "South Extension", "Rohini", "Greater Kailash", "Lajpat Nagar", "Mayur Vihar",
    "Janakpuri", "Rajouri Garden", "Pitampura", "Chanakyapuri", "Def Col"
  ],
  "Hyderabad": [
    "Gachibowli", "Madhapur", "Jubilee Hills", "Banjara Hills", "Kondapur", 
    "Kukatpally", "Secunderabad", "Ameerpet", "Begumpet", "Hitech City",
    "Miyapur", "Manikonda", "Nanakramguda", "Somajiguda", "Begumpet"
  ],
  "Chennai": [
    "Adyar", "Velachery", "T Nagar", "Mylapore", "Nungambakkam", 
    "Anna Nagar", "OMR", "ECR", "Thiruvanmiyur", "Guindy",
    "Perungudi", "Sholinganallur", "Tambaram", "Royapettah", "Besant Nagar"
  ],
  "Pune": [
    "Kothrud", "Koregaon Park", "Baner", "Viman Nagar", "Hinjawadi", 
    "Hadapsar", "Wakad", "Kalyani Nagar", "Aundh", "Shivaji Nagar",
    "Kharadi", "Pimple Saudagar", "Magarpatta", "Bavdhan", "Katraj"
  ],
  "Kolkata": [
    "Salt Lake", "New Town", "Alipore", "Ballygunge", "Park Street", 
    "Garia", "Tollygunge", "Dum Dum", "Howrah", "Behala",
    "Jadavpur", "Saltlake Sector V", "Lake Gardens", "Elgin", "Barasat"
  ],
  "Ahmedabad": [
    "Satellite", "Vastrapur", "SG Highway", "Bodakdev", "Prahlad Nagar", 
    "Navrangpura", "Naranpura", "CG Road", "Gota", "Bopal",
    "Ambawadi", "Paldi", "Ghatlodia", "Maninagar", "Sabarmati"
  ],
  "Gurugram": [
    "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "Sector 56", "Sector 57", 
    "Sector 49", "Sector 82", "Sohna Road", "Golf Course Road", "Sushant Lok",
    "Sector 45", "Sector 15", "Sector 23", "Nirvana Country", "Sector 102"
  ],
  "Noida": [
    "Sector 15", "Sector 62", "Sector 18", "Sector 50", "Sector 76", 
    "Sector 93", "Sector 137", "Sector 150", "Noida Extension", "Sector 44",
    "Sector 21", "Sector 34", "Sector 128", "Sector 143", "Sector 110"
  ],
  "Kochi": [
    "Kakkanad", "Edappally", "Ernakulam", "Vyttila", "Fort Kochi", 
    "Marine Drive", "Kadavanthra", "Palarivattom", "Aluva", "Tripunithura",
    "Kalamassery", "Thevara", "Panampilly Nagar", "Kacheripady", "Ravipuram"
  ],
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

async function main() {
  console.log("Seeding extra localities for cities...");

  for (const [cityName, localities] of Object.entries(cityLocalities)) {
    const city = await prisma.city.findFirst({
      where: { name: { equals: cityName, mode: "insensitive" } },
    });

    if (!city) {
      console.log(`City not found in DB: ${cityName}. Skipping...`);
      continue;
    }

    console.log(`Processing localities for ${city.name} (${city.id})...`);

    for (const name of localities) {
      const slug = slugify(name);
      
      // Check if locality already exists
      const existing = await prisma.locality.findFirst({
        where: {
          cityId: city.id,
          name: { equals: name, mode: "insensitive" },
        },
      });

      if (!existing) {
        await prisma.locality.create({
          data: {
            name,
            slug,
            cityId: city.id,
          },
        });
        console.log(`Created locality: ${name} in ${city.name}`);
      } else {
        console.log(`Locality ${name} already exists in ${city.name}`);
      }
    }
  }

  console.log("Seeding extra localities completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
