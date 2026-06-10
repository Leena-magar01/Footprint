import Challenge from '../models/Challenge';

const initialChallenges = [
  {
    title: 'Reusable Water Bottle',
    description: 'Carry and use a reusable water bottle today instead of buying single-use plastic bottles.',
    category: 'water',
    type: 'daily',
    points: 20,
    requirements: { targetCount: 1 }
  },
  {
    title: 'Turn Off Standby Power',
    description: 'Unplug chargers and appliances when not in use to eliminate phantom electricity draw.',
    category: 'electricity',
    type: 'daily',
    points: 15,
    requirements: { targetCount: 1 }
  },
  {
    title: 'Green Commute Today',
    description: 'Walk, cycle, or use public transport for your daily travel instead of a private petrol car.',
    category: 'transportation',
    type: 'daily',
    points: 30,
    requirements: { targetCount: 1 }
  },
  {
    title: 'Plant-Based Day',
    description: 'Avoid meat consumption for all meals today. Swap for vegan or vegetarian options.',
    category: 'food',
    type: 'daily',
    points: 25,
    requirements: { targetCount: 1 }
  },
  {
    title: 'Zero Food Waste Week',
    description: 'Plan your meals, store food properly, and ensure zero food waste is thrown away this week.',
    category: 'food',
    type: 'weekly',
    points: 120,
    requirements: { targetCount: 7 }
  },
  {
    title: 'No Fast-Fashion Shopping',
    description: 'Refrain from buying clothing or non-essential packaged goods for the next 7 days.',
    category: 'shopping',
    type: 'weekly',
    points: 100,
    requirements: { targetCount: 1 }
  },
  {
    title: 'Eco Showers',
    description: 'Limit all daily shower times to 5 minutes or less for the next 7 days to conserve water and hot water energy.',
    category: 'water',
    type: 'weekly',
    points: 90,
    requirements: { targetCount: 7 }
  },
  {
    title: 'Carbon-Free Travel Week',
    description: 'Commute exclusively via public transit, walking, or cycling for the entire week.',
    category: 'transportation',
    type: 'weekly',
    points: 150,
    requirements: { targetCount: 7 }
  }
];

export const seedChallenges = async (): Promise<void> => {
  try {
    const count = await Challenge.countDocuments({});
    if (count === 0) {
      console.log('Seeding initial eco challenges into database...');
      await Challenge.insertMany(initialChallenges);
      console.log('Eco challenges seeded successfully.');
    } else {
      console.log('Database already has eco challenges. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding challenges:', error);
  }
};
