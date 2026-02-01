/**
 * Netita Properties - Property Database
 * Static data containing all properties
 * This data is used throughout the application
 */

const properties = [
    {
        id: 1,
        address: '123 Oak Street',
        location: 'Downtown District',
        price: 450000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 2100,
        image: 'assets/images/Property_1/Screenshot 2026-02-01 101125.png',
        images: [
            'assets/images/Property_1/Screenshot 2026-02-01 101125.png',
            'assets/images/Property_1/Screenshot 2026-02-01 101134.png',
            'assets/images/Property_1/Screenshot 2026-02-01 101143.png',
            'assets/images/Property_1/Screenshot 2026-02-01 101150.png'
        ],
        yearBuilt: 2015,
        type: 'Single Family',
        description: 'Beautiful modern home in the heart of downtown with spacious rooms and natural light.',
        amenities: ['Swimming Pool', 'Garage', 'Patio', 'Garden'],
        listingDate: '2025-12-15'
    },
    {
        id: 2,
        address: '456 Maple Avenue',
        location: 'Riverside',
        price: 385000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1800,
        image: 'assets/images/Property_2/Screenshot 2026-02-01 101230.png',
        images: [
            'assets/images/Property_2/Screenshot 2026-02-01 101230.png',
            'assets/images/Property_2/Screenshot 2026-02-01 101239.png'
        ],
        yearBuilt: 2018,
        type: 'Condo',
        description: 'Elegant condo with river views and modern amenities. Perfect for families or investors.',
        amenities: ['River View', 'Balcony', 'Gym', 'Security'],
        listingDate: '2025-12-10'
    },
    {
        id: 3,
        address: '789 Pine Road',
        location: 'Suburban Heights',
        price: 520000,
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2800,
        image: 'assets/images/Property_3/Screenshot 2026-02-01 101306.png',
        images: [
            'assets/images/Property_3/Screenshot 2026-02-01 101306.png',
            'assets/images/Property_3/Screenshot 2026-02-01 101316.png',
            'assets/images/Property_3/Screenshot 2026-02-01 101324.png'
        ],
        yearBuilt: 2010,
        type: 'Single Family',
        description: 'Spacious family home with large backyard, ideal for entertaining and outdoor activities.',
        amenities: ['Large Backyard', '2-Car Garage', 'Deck', 'Sprinkler System'],
        listingDate: '2025-12-08'
    },
    {
        id: 4,
        address: '321 Elm Street',
        location: 'Midtown',
        price: 295000,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 1200,
        image: 'assets/images/Property_4/Screenshot 2026-02-01 101402.png',
        images: [
            'assets/images/Property_4/Screenshot 2026-02-01 101402.png',
            'assets/images/Property_4/Screenshot 2026-02-01 101412.png',
            'assets/images/Property_4/Screenshot 2026-02-01 101421.png',
            'assets/images/Property_4/Screenshot 2026-02-01 101429.png'
        ],
        yearBuilt: 2020,
        type: 'Apartment',
        description: 'Trendy urban loft with high ceilings and exposed brick. Walk to shops and restaurants.',
        amenities: ['High Ceilings', 'Exposed Brick', 'Hardwood Floors', 'Downtown Location'],
        listingDate: '2025-12-05'
    },
    {
        id: 5,
        address: '654 Birch Lane',
        location: 'Green Valley',
        price: 425000,
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 2200,
        image: 'assets/images/Property_5/Screenshot 2026-02-01 103744.png',
        images: [
            'assets/images/Property_5/Screenshot 2026-02-01 103744.png',
            'assets/images/Property_5/Screenshot 2026-02-01 103749.png',
            'assets/images/Property_5/Screenshot 2026-02-01 103755.png'
        ],
        yearBuilt: 2016,
        type: 'Single Family',
        description: 'Charming rural home surrounded by nature with private pond and scenic views.',
        amenities: ['Pond', 'Mountain View', 'Barn', 'Pasture'],
        listingDate: '2025-12-01'
    },
    {
        id: 6,
        address: '987 Cedar Court',
        location: 'Business District',
        price: 650000,
        bedrooms: 4,
        bathrooms: 3.5,
        sqft: 3200,
        image: 'assets/images/Property_6/Screenshot 2026-02-01 103812.png',
        images: [
            'assets/images/Property_6/Screenshot 2026-02-01 103812.png',
            'assets/images/Property_6/Screenshot 2026-02-01 103818.png',
            'assets/images/Property_6/Screenshot 2026-02-01 103824.png'
        ],
        yearBuilt: 2012,
        type: 'Penthouse',
        description: 'Luxury penthouse in prime business district with panoramic city views and premium finishes.',
        amenities: ['City Views', '2 Terraces', 'Wine Cellar', 'Smart Home'],
        listingDate: '2025-11-28'
    },
    {
        id: 7,
        address: '147 Willow Drive',
        location: 'Lakeside',
        price: 580000,
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2600,
        image: 'assets/images/Property_7/Screenshot 2026-02-01 103924.png',
        images: [
            'assets/images/Property_7/Screenshot 2026-02-01 103924.png',
            'assets/images/Property_7/Screenshot 2026-02-01 103934.png',
            'assets/images/Property_7/Screenshot 2026-02-01 103939.png',
            'assets/images/Property_7/Screenshot 2026-02-01 103945.png',
            'assets/images/Property_7/Screenshot 2026-02-01 103953.png',
            'assets/images/Property_7/Screenshot 2026-02-01 103959.png',
            'assets/images/Property_7/Screenshot 2026-02-01 104004.png'
        ],
        yearBuilt: 2014,
        type: 'Villa',
        description: 'Waterfront villa with private beach access, perfect for water enthusiasts.',
        amenities: ['Beach Access', 'Dock', 'Hot Tub', 'Boat House'],
        listingDate: '2025-11-25'
    },
    {
        id: 8,
        address: '258 Spruce Street',
        location: 'Historic District',
        price: 375000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1950,
        image: 'assets/images/Property_8/Screenshot 2026-02-01 110012.png',
        images: [
            'assets/images/Property_8/Screenshot 2026-02-01 110012.png',
            'assets/images/Property_8/Screenshot 2026-02-01 110018.png',
            'assets/images/Property_8/Screenshot 2026-02-01 110023.png',
            'assets/images/Property_8/Screenshot 2026-02-01 110028.png',
            'assets/images/Property_8/Screenshot 2026-02-01 110044.png'
        ],
        yearBuilt: 2008,
        type: 'Single Family',
        description: 'Restored Victorian home with original hardwood floors and classic architectural details.',
        amenities: ['Hardwood Floors', 'Fireplace', 'Wraparound Porch', 'Crown Molding'],
        listingDate: '2025-11-22'
    },
    {
        id: 9,
        address: '369 Ash Avenue',
        location: 'Art District',
        price: 320000,
        bedrooms: 2,
        bathrooms: 1.5,
        sqft: 1350,
        image: 'assets/images/Property_9/Screenshot 2026-02-01 105812.png',
        images: [
            'assets/images/Property_9/Screenshot 2026-02-01 105812.png',
            'assets/images/Property_9/Screenshot 2026-02-01 105820.png',
            'assets/images/Property_9/Screenshot 2026-02-01 105827.png',
            'assets/images/Property_9/Screenshot 2026-02-01 105834.png',
            'assets/images/Property_9/Screenshot 2026-02-01 105842.png',
            'assets/images/Property_9/Screenshot 2026-02-01 105848.png',
            'assets/images/Property_9/Screenshot 2026-02-01 105904.png',
            'assets/images/Property_9/Screenshot 2026-02-01 105912.png',
            'assets/images/Property_9/Screenshot 2026-02-01 105920.png'
        ],
        yearBuilt: 2019,
        type: 'Loft',
        description: 'Artist loft with skylights, open floor plan, and plenty of natural light.',
        amenities: ['Skylights', 'Polished Concrete', 'Open Floor Plan', 'Industrial Feel'],
        listingDate: '2025-11-20'
    },
    {
        id: 10,
        address: '741 Poplar Road',
        location: 'Suburban Green',
        price: 465000,
        bedrooms: 4,
        bathrooms: 2.5,
        sqft: 2400,
        image: 'assets/images/Property_10/Screenshot 2026-02-01 110310.png',
        images: [
            'assets/images/Property_10/Screenshot 2026-02-01 110310.png',
            'assets/images/Property_10/Screenshot 2026-02-01 110317.png',
            'assets/images/Property_10/Screenshot 2026-02-01 110324.png',
            'assets/images/Property_10/Screenshot 2026-02-01 110338.png',
            'assets/images/Property_10/Screenshot 2026-02-01 110343.png'
        ],
        yearBuilt: 2013,
        type: 'Single Family',
        description: 'Great family home near schools and parks with updated kitchen and bathrooms.',
        amenities: ['Updated Kitchen', 'Master Suite', 'Deck', 'Near Schools'],
        listingDate: '2025-11-18'
    },
    {
        id: 11,
        address: '852 Hickory Lane',
        location: 'Golf Community',
        price: 595000,
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2900,
        image: 'assets/images/Property_11/Screenshot 2026-02-01 110423.png',
        images: [
            'assets/images/Property_11/Screenshot 2026-02-01 110423.png'
        ],
        yearBuilt: 2011,
        type: 'Single Family',
        description: 'Exclusive home in gated golf community with championship course access.',
        amenities: ['Golf Course Access', 'Gated Community', 'Country Club', 'Security Gate'],
        listingDate: '2025-11-15'
    },
    {
        id: 12,
        address: '963 Hazel Street',
        location: 'Trendy Quarter',
        price: 340000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1400,
        image: 'assets/images/Property_12/Screenshot 2026-02-01 110442.png',
        images: [
            'assets/images/Property_12/Screenshot 2026-02-01 110442.png',
            'assets/images/Property_12/Screenshot 2026-02-01 110448.png',
            'assets/images/Property_12/Screenshot 2026-02-01 110456.png',
            'assets/images/Property_12/Screenshot 2026-02-01 110502.png'
        ],
        yearBuilt: 2021,
        type: 'Condo',
        description: 'Brand new modern condo in the heart of the trendy quarter with all contemporary features.',
        amenities: ['Modern Design', 'Smart Home', 'Rooftop Terrace', 'In-Unit Laundry'],
        listingDate: '2025-11-12'
    },
    {
        id: 13,
        address: '147 Magnolia Drive',
        location: 'Coastal',
        price: 720000,
        bedrooms: 5,
        bathrooms: 4,
        sqft: 3500,
        image: 'assets/images/Property_13/Screenshot 2026-02-01 110626.png',
        images: [
            'assets/images/Property_13/Screenshot 2026-02-01 110626.png',
            'assets/images/Property_13/Screenshot 2026-02-01 110633.png',
            'assets/images/Property_13/Screenshot 2026-02-01 110639.png'
        ],
        yearBuilt: 2009,
        type: 'Beachfront',
        description: 'Stunning beachfront property with panoramic ocean views and direct beach access.',
        amenities: ['Beachfront', 'Ocean View', 'Patio', 'Wave Access'],
        listingDate: '2025-11-10'
    },
    {
        id: 14,
        address: '258 Mulberry Lane',
        location: 'Quiet Neighborhood',
        price: 445000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 2050,
        image: 'assets/images/Property_14/Screenshot 2026-02-01 110742.png',
        images: [
            'assets/images/Property_14/Screenshot 2026-02-01 110742.png',
            'assets/images/Property_14/Screenshot 2026-02-01 110750.png',
            'assets/images/Property_14/Screenshot 2026-02-01 110755.png'
        ],
        yearBuilt: 2017,
        type: 'Single Family',
        description: 'Quiet neighborhood home with mature trees, peaceful setting, and great for families.',
        amenities: ['Mature Trees', 'Quiet Street', 'Cul-de-sac', 'Privacy'],
        listingDate: '2025-11-08'
    },
    {
        id: 15,
        address: '369 Juniper Road',
        location: 'Downtown Lofts',
        price: 385000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1500,
        image: 'assets/images/Property_15/Screenshot 2026-02-01 110828.png',
        images: [
            'assets/images/Property_15/Screenshot 2026-02-01 110828.png',
            'assets/images/Property_15/Screenshot 2026-02-01 110834.png',
            'assets/images/Property_15/Screenshot 2026-02-01 110846.png',
            'assets/images/Property_15/Screenshot 2026-02-01 110852.png'
        ],
        yearBuilt: 2018,
        type: 'Loft',
        description: 'Industrial-chic loft in converted warehouse with exposed beams and large windows.',
        amenities: ['Exposed Beams', 'Large Windows', 'Polished Concrete Floors', 'City Views'],
        listingDate: '2025-11-05'
    },
    {
        id: 16,
        address: '741 Chestnut Street',
        location: 'Garden District',
        price: 510000,
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2600,
        image: 'assets/images/Property_16/Screenshot 2026-02-01 112306.png',
        images: [
            'assets/images/Property_16/Screenshot 2026-02-01 112306.png',
            'assets/images/Property_16/Screenshot 2026-02-01 112312.png',
            'assets/images/Property_16/Screenshot 2026-02-01 112318.png'
        ],
        yearBuilt: 2015,
        type: 'Single Family',
        description: 'Elegant home in prestigious garden district with landscaped gardens and fountain.',
        amenities: ['Landscaped Gardens', 'Fountain', 'Stone Patio', 'Ornamental Trees'],
        listingDate: '2025-11-03'
    },
    {
        id: 17,
        address: '852 Sycamore Lane',
        location: 'University Area',
        price: 265000,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 1000,
        image: 'assets/images/Property_17/Screenshot 2026-02-01 112332.png',
        images: [
            'assets/images/Property_17/Screenshot 2026-02-01 112332.png',
            'assets/images/Property_17/Screenshot 2026-02-01 112337.png',
            'assets/images/Property_17/Screenshot 2026-02-01 112343.png'
        ],
        yearBuilt: 2020,
        type: 'Apartment',
        description: 'Perfect investment property in university area with strong rental potential.',
        amenities: ['Rental Potential', 'Updated', 'Close to Campus', 'Good Condition'],
        listingDate: '2025-11-01'
    },
    {
        id: 18,
        address: '963 Ash Lane',
        location: 'Mountain View',
        price: 625000,
        bedrooms: 4,
        bathrooms: 3.5,
        sqft: 3000,
        image: 'assets/images/Property_18/Screenshot 2026-02-01 112359.png',
        images: [
            'assets/images/Property_18/Screenshot 2026-02-01 112359.png',
            'assets/images/Property_18/Screenshot 2026-02-01 112414.png',
            'assets/images/Property_18/Screenshot 2026-02-01 112424.png',
            'assets/images/Property_18/Screenshot 2026-02-01 112430.png'
        ],
        yearBuilt: 2012,
        type: 'Single Family',
        description: 'Stunning mountain view home with wraparound deck and natural scenic backdrop.',
        amenities: ['Mountain View', 'Wraparound Deck', 'Fireplace', 'Natural Setting'],
        listingDate: '2025-10-28'
    },
    {
        id: 19,
        address: '147 Dogwood Court',
        location: 'Executive Park',
        price: 555000,
        bedrooms: 4,
        bathrooms: 2.5,
        sqft: 2500,
        image: 'assets/images/Property_19/Screenshot 2026-02-01 112456.png',
        images: [
            'assets/images/Property_19/Screenshot 2026-02-01 112456.png',
            'assets/images/Property_19/Screenshot 2026-02-01 112502.png',
            'assets/images/Property_19/Screenshot 2026-02-01 112509.png',
            'assets/images/Property_19/Screenshot 2026-02-01 112517.png'
        ],
        yearBuilt: 2016,
        type: 'Single Family',
        description: 'Executive home in prestigious park with high-end finishes and professional landscaping.',
        amenities: ['Premium Finishes', 'Professional Landscaping', 'Executive Kitchen', 'Spa Bathroom'],
        listingDate: '2025-10-25'
    },
    {
        id: 20,
        address: '258 Cottonwood Road',
        location: 'River District',
        price: 475000,
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 2300,
        image: 'assets/images/Property_20/Screenshot 2026-02-01 112734.png',
        images: [
            'assets/images/Property_20/Screenshot 2026-02-01 112734.png',
            'assets/images/Property_20/Screenshot 2026-02-01 112745.png',
            'assets/images/Property_20/Screenshot 2026-02-01 112757.png',
            'assets/images/Property_20/Screenshot 2026-02-01 112803.png'
        ],
        yearBuilt: 2014,
        type: 'Single Family',
        description: 'Riverfront home with scenic views and easy access to outdoor recreation.',
        amenities: ['River View', 'Kayak Launch', 'Patio', 'Nature Access'],
        listingDate: '2025-10-22'
    }
];
