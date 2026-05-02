import { Day } from "./types";
import { generateId } from "./time-utils";

export interface Template {
  name: string;
  description: string;
  days: () => Day[];
}

function item(
  time: string,
  initials: string[],
  description: string,
  subNote?: string,
  isBold?: boolean
) {
  return { id: generateId(), time, initials, description, subNote, isBold };
}

export const templates: Template[] = [
  {
    name: "Full Wedding Weekend",
    description: "Rehearsal dinner, welcome party, and wedding day with full vendor timeline",

    days: () => [
      {
        label: "Friday — Rehearsal & Welcome",
        sections: [
          {
            title: "REHEARSAL",
            items: [
              item("3:00 PM", ["ALL"], "Planning team arrives for rehearsal walk-through", "Meet at venue; confirm ceremony layout"),
              item("4:00 PM", ["ALL"], "Wedding rehearsal begins", "Run full ceremony sequence with officiant", true),
              item("5:00 PM", ["ALL"], "Rehearsal concludes", "Transition to welcome party"),
            ],
          },
          {
            title: "WELCOME PARTY",
            items: [
              item("6:30 PM", ["ALL"], "Welcome party begins", "Cocktail attire", true),
              item("9:00 PM", ["ALL"], "Welcome party concludes"),
            ],
          },
        ],
      },
      {
        label: "Saturday — Wedding Day",
        sections: [
          {
            title: "VENDOR SETUP & PREPARATION",
            items: [
              item("6:00 AM", ["ALL"], "Floral team load-in begins", "Service entrance; coordinate with venue"),
              item("7:00 AM", ["ALL"], "Rentals delivery and setup", "Linens, chargers, specialty furniture"),
              item("8:00 AM", ["ALL"], "Planning team arrives on site", "Team briefing; review day-of timeline", true),
            ],
          },
          {
            title: "HAIR & MAKEUP",
            items: [
              item("9:00 AM", ["ALL"], "Hair and makeup team arrives at bridal suite"),
              item("9:30 AM", ["ALL"], "Bridal party hair and makeup begins", "Bride scheduled last for freshest look", true),
              item("12:00 PM", ["ALL"], "Bride hair and makeup begins"),
            ],
          },
          {
            title: "PHOTOGRAPHY & FIRST LOOK",
            items: [
              item("1:30 PM", ["ALL"], "Photo and video teams arrive", "Gear setup; review shot list", true),
              item("2:00 PM", ["ALL"], "Detail shots — rings, invitation suite, shoes, dress"),
              item("3:30 PM", ["ALL"], "First look", "Private location", true),
            ],
          },
          {
            title: "CEREMONY",
            items: [
              item("5:00 PM", ["ALL"], "Ceremony doors open — guests begin seating"),
              item("5:30 PM", ["ALL"], "Bridal party lineup"),
              item("6:00 PM", ["ALL"], "Ceremony begins", undefined, true),
              item("6:30 PM", ["ALL"], "Ceremony concludes — cocktail hour begins", undefined, true),
            ],
          },
          {
            title: "COCKTAIL HOUR & RECEPTION",
            items: [
              item("6:30 PM", ["ALL"], "Cocktail hour begins", "Passed hors d'oeuvres and bar service"),
              item("7:30 PM", ["ALL"], "Grand introduction and first dance", undefined, true),
              item("8:00 PM", ["ALL"], "Dinner service begins"),
              item("9:00 PM", ["ALL"], "Dance floor opens", undefined, true),
              item("11:00 PM", ["ALL"], "Last dance and sendoff", undefined, true),
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Single Day Wedding",
    description: "One day, all essentials — setup through sendoff",

    days: () => [
      {
        label: "Wedding Day",
        sections: [
          {
            title: "VENDOR SETUP & PREPARATION",
            items: [
              item("8:00 AM", ["ALL"], "Vendor load-in begins"),
              item("9:00 AM", ["ALL"], "Planning team arrives on site", "Team briefing; review timeline", true),
              item("10:00 AM", ["ALL"], "Setup oversight and vendor coordination"),
            ],
          },
          {
            title: "HAIR & MAKEUP",
            items: [
              item("10:00 AM", ["ALL"], "Hair and makeup team arrives"),
              item("10:30 AM", ["ALL"], "Bridal party hair and makeup begins", undefined, true),
              item("1:00 PM", ["ALL"], "Bride hair and makeup begins"),
            ],
          },
          {
            title: "PHOTOGRAPHY & FIRST LOOK",
            items: [
              item("2:00 PM", ["ALL"], "Photo and video teams arrive", undefined, true),
              item("2:30 PM", ["ALL"], "Detail shots and getting-ready coverage"),
              item("3:30 PM", ["ALL"], "First look", undefined, true),
            ],
          },
          {
            title: "CEREMONY",
            items: [
              item("5:00 PM", ["ALL"], "Guests begin seating"),
              item("5:30 PM", ["ALL"], "Ceremony begins", undefined, true),
              item("6:00 PM", ["ALL"], "Ceremony concludes", undefined, true),
            ],
          },
          {
            title: "RECEPTION",
            items: [
              item("6:00 PM", ["ALL"], "Cocktail hour begins"),
              item("7:00 PM", ["ALL"], "Grand entrance and first dance", undefined, true),
              item("7:30 PM", ["ALL"], "Dinner service begins"),
              item("8:30 PM", ["ALL"], "Toasts and cake cutting", undefined, true),
              item("9:00 PM", ["ALL"], "Dance floor opens"),
              item("11:00 PM", ["ALL"], "Last dance and sendoff", undefined, true),
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Micro Wedding",
    description: "Intimate ceremony for 50 or fewer guests, streamlined timeline",

    days: () => [
      {
        label: "Wedding Day",
        sections: [
          {
            title: "PREPARATION",
            items: [
              item("10:00 AM", ["ALL"], "Vendor setup and floral installation"),
              item("11:00 AM", ["ALL"], "Hair and makeup begins"),
              item("1:00 PM", ["ALL"], "Photography begins — detail shots", undefined, true),
            ],
          },
          {
            title: "CEREMONY & CELEBRATION",
            items: [
              item("3:00 PM", ["ALL"], "Guests arrive"),
              item("3:30 PM", ["ALL"], "Ceremony begins", undefined, true),
              item("4:00 PM", ["ALL"], "Ceremony concludes — champagne toast"),
              item("4:30 PM", ["ALL"], "Couple portraits"),
              item("5:30 PM", ["ALL"], "Intimate dinner begins", undefined, true),
              item("7:30 PM", ["ALL"], "First dance and celebration"),
              item("9:00 PM", ["ALL"], "Evening concludes", undefined, true),
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Multi-Day Destination",
    description: "Three-day celebration — welcome, activities, and wedding day",

    days: () => [
      {
        label: "Day 1 — Welcome & Arrivals",
        sections: [
          {
            title: "GUEST ARRIVALS",
            items: [
              item("12:00 PM", ["ALL"], "Check-in opens at venue/resort"),
              item("2:00 PM", ["ALL"], "Welcome bags distributed to guest rooms"),
              item("4:00 PM", ["ALL"], "Planning team welcome meeting", undefined, true),
            ],
          },
          {
            title: "WELCOME DINNER",
            items: [
              item("6:00 PM", ["ALL"], "Welcome cocktails begin"),
              item("7:00 PM", ["ALL"], "Welcome dinner", undefined, true),
              item("9:30 PM", ["ALL"], "Evening concludes"),
            ],
          },
        ],
      },
      {
        label: "Day 2 — Activities & Rehearsal",
        sections: [
          {
            title: "DAYTIME ACTIVITIES",
            items: [
              item("9:00 AM", ["ALL"], "Guest breakfast"),
              item("10:00 AM", ["ALL"], "Group activity — excursion or leisure", "Coordinate transportation"),
              item("1:00 PM", ["ALL"], "Lunch"),
            ],
          },
          {
            title: "REHEARSAL",
            items: [
              item("4:00 PM", ["ALL"], "Wedding rehearsal", undefined, true),
              item("5:30 PM", ["ALL"], "Rehearsal dinner begins", undefined, true),
              item("8:00 PM", ["ALL"], "After-party or bonfire"),
            ],
          },
        ],
      },
      {
        label: "Day 3 — Wedding Day",
        sections: [
          {
            title: "SETUP & PREPARATION",
            items: [
              item("7:00 AM", ["ALL"], "Vendor load-in and setup"),
              item("9:00 AM", ["ALL"], "Planning team arrives", undefined, true),
              item("10:00 AM", ["ALL"], "Hair and makeup begins"),
            ],
          },
          {
            title: "CEREMONY",
            items: [
              item("4:00 PM", ["ALL"], "Guest seating begins"),
              item("4:30 PM", ["ALL"], "Ceremony begins", undefined, true),
              item("5:00 PM", ["ALL"], "Ceremony concludes", undefined, true),
            ],
          },
          {
            title: "RECEPTION",
            items: [
              item("5:00 PM", ["ALL"], "Cocktail hour"),
              item("6:30 PM", ["ALL"], "Reception — dinner and dancing", undefined, true),
              item("10:30 PM", ["ALL"], "Sparkler sendoff", undefined, true),
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Ceremony Only",
    description: "Simple ceremony with no reception — elopement or courthouse style",

    days: () => [
      {
        label: "Ceremony Day",
        sections: [
          {
            title: "PREPARATION",
            items: [
              item("10:00 AM", ["ALL"], "Hair and makeup"),
              item("11:30 AM", ["ALL"], "Getting-ready photography", undefined, true),
            ],
          },
          {
            title: "CEREMONY",
            items: [
              item("1:00 PM", ["ALL"], "Arrive at ceremony location"),
              item("1:30 PM", ["ALL"], "Ceremony begins", undefined, true),
              item("2:00 PM", ["ALL"], "Ceremony concludes"),
              item("2:15 PM", ["ALL"], "Couple portraits", undefined, true),
              item("3:00 PM", ["ALL"], "Celebration lunch or departure"),
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Corporate Gala",
    description: "Black-tie fundraiser or corporate event with program and entertainment",

    days: () => [
      {
        label: "Event Day",
        sections: [
          {
            title: "VENUE SETUP",
            items: [
              item("10:00 AM", ["ALL"], "Vendor load-in begins"),
              item("12:00 PM", ["ALL"], "AV and lighting setup", "Sound check and walk-through", true),
              item("2:00 PM", ["ALL"], "Floral and decor installation"),
              item("4:00 PM", ["ALL"], "Final walk-through with client", undefined, true),
            ],
          },
          {
            title: "COCKTAIL RECEPTION",
            items: [
              item("6:00 PM", ["ALL"], "Doors open — red carpet and step-and-repeat"),
              item("6:30 PM", ["ALL"], "Cocktail hour with live music", undefined, true),
              item("7:15 PM", ["ALL"], "Guests invited to main ballroom"),
            ],
          },
          {
            title: "PROGRAM & DINNER",
            items: [
              item("7:30 PM", ["ALL"], "Welcome remarks and program begins", undefined, true),
              item("8:00 PM", ["ALL"], "Dinner service — first course"),
              item("8:45 PM", ["ALL"], "Keynote or honoree presentation", undefined, true),
              item("9:15 PM", ["ALL"], "Live auction or paddle raise"),
              item("9:45 PM", ["ALL"], "Dessert and dance floor opens"),
              item("11:00 PM", ["ALL"], "Event concludes — guest departure", undefined, true),
            ],
          },
        ],
      },
    ],
  },
];
