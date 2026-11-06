import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { products, categories, gemstones, defaultRates } from "../src/lib/catalog";
import { fullAddress } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seeding JMD Gems & Jewellery");

  for (const [i, c] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameHi: c.nameHi, image: c.image, sortOrder: i },
      create: { slug: c.slug, name: c.name, nameHi: c.nameHi, image: c.image, sortOrder: i },
    });
  }

  for (const g of gemstones) {
    await prisma.gemstone.upsert({
      where: { slug: g.slug },
      update: { name: g.name, nameHi: g.nameHi, color: g.color, hex: g.hex, benefit: g.benefit, benefitHi: g.benefitHi },
      create: {
        slug: g.slug,
        name: g.name,
        nameHi: g.nameHi,
        color: g.color,
        hex: g.hex,
        benefit: g.benefit,
        benefitHi: g.benefitHi,
        originNote: g.originNote,
      },
    });
  }

  for (const r of defaultRates) {
    await prisma.metalRate.upsert({
      where: { purity: r.purity },
      update: { ratePerGram: r.ratePerGram },
      create: { metal: r.metal, purity: r.purity, ratePerGram: r.ratePerGram },
    });
  }

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } });
    const gemstone = p.gemstoneSlug ? await prisma.gemstone.findUnique({ where: { slug: p.gemstoneSlug } }) : null;

    const data = {
      name: p.name,
      nameHi: p.nameHi,
      subtitle: p.subtitle,
      description: p.description,
      story: p.story,
      metal: p.metal,
      metalColor: p.metalColor,
      purity: p.purity,
      metalWeight: p.weight,
      gemstoneValue: p.gemstoneValue,
      gemstoneCarats: p.gemstoneCarats,
      makingPct: p.makingPct,
      images: p.images,
      collections: p.collections,
      occasions: p.occasions,
      sizes: p.sizes,
      badges: p.badges,
      certifications: p.certifications,
      certificateNo: p.certificateNo,
      certificateUrl: `/certificates/${p.slug}.pdf`,
      stock: p.stock,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isFeatured: p.featured ?? false,
      isNew: p.isNew ?? false,
      isBestseller: p.bestseller ?? false,
      categoryId: category?.id,
      gemstoneId: gemstone?.id,
    };

    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });

    for (const [i, size] of p.sizes.entries()) {
      await prisma.variant.upsert({
        where: { sku: `${p.slug}-${i}` },
        update: { size, stock: p.stock },
        create: { productId: created.id, sku: `${p.slug}-${i}`, size, stock: p.stock },
      });
    }
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@jmdgems.in";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "JmdAdmin@2026";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "JMD Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  const existingStore = await prisma.storeInfo.findFirst();
  if (!existingStore) {
    await prisma.storeInfo.create({
      data: {
        name: "JMD Gems & Jewellery",
        address: fullAddress,
        city: "Hindaun",
        pincode: "322230",
        state: "Rajasthan",
        phones: ["7891384376", "6377419074"],
        hours: "Mon – Sun · 10:30 AM – 8:30 PM",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Jagdamba+Market+Mohan+Nagar+Hindaun",
        photo: "/images/bridal-hands.webp",
        about:
          "Three generations of the Jain family have weighed, certified and set jewellery at Jagdamba Market, Hindaun.",
        festivalMode: true,
      },
    });
  }

  console.log(`✓ ${products.length} products, ${categories.length} categories, rates and store seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
