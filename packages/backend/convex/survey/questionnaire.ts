export type SurveyOption = {
  label: string;
  value: string;
};

export type SurveyFieldType =
  | "text"
  | "number"
  | "textarea"
  | "radio"
  | "checkboxes";

export type SurveyField = {
  id: string;
  label: string;
  type: SurveyFieldType;
  required?: boolean;
  unit?: string;
  min?: number;
  max?: number;
  options?: SurveyOption[];
};

export type SurveySection = {
  id: string;
  title: string;
  description?: string;
  fields: SurveyField[];
};

const yesNoOptions: SurveyOption[] = [
  { label: "No [0]", value: "0" },
  { label: "Yes [1]", value: "1" },
];

const frequencyF2Options: SurveyOption[] = [
  { label: "Never [0]", value: "0" },
  { label: "1-2 days/week [1]", value: "1" },
  { label: "3-4 days/week [2]", value: "2" },
  { label: "5-6 days/week [3]", value: "3" },
  { label: "Daily [4]", value: "4" },
];

const twoWeekFrequencyOptions: SurveyOption[] = [
  { label: "Not at all [0]", value: "0" },
  { label: "Several days [1]", value: "1" },
  { label: ">half the days [2]", value: "2" },
  { label: "Nearly every day [3]", value: "3" },
];

const noSometimesYesOptions: SurveyOption[] = [
  { label: "No [0]", value: "0" },
  { label: "Sometimes [1]", value: "1" },
  { label: "Yes [2]", value: "2" },
];

const dietaryDiversityFields: SurveyField[] = [
  { id: "B1", label: "Cereals: rice, wheat/atta, maize, bread, noodles", type: "radio", required: true, options: yesNoOptions },
  { id: "B2", label: "White roots and tubers: potato, white yam/cassava, taro", type: "radio", required: true, options: yesNoOptions },
  { id: "B3", label: "Vitamin A-rich vegetables/tubers: pumpkin, carrot, orange sweet potato", type: "radio", required: true, options: yesNoOptions },
  { id: "B4", label: "Dark green leafy vegetables: spinach, amaranth, mustard/moringa", type: "radio", required: true, options: yesNoOptions },
  { id: "B5", label: "Other vegetables: tomato, onion, eggplant, cabbage", type: "radio", required: true, options: yesNoOptions },
  { id: "B6", label: "Vitamin A-rich fruits: ripe mango/papaya, cantaloupe", type: "radio", required: true, options: yesNoOptions },
  { id: "B7", label: "Other fruits: banana, apple, guava, citrus", type: "radio", required: true, options: yesNoOptions },
  { id: "B8", label: "Organ meat: liver, kidney, heart, other offal", type: "radio", required: true, options: yesNoOptions },
  { id: "B9", label: "Flesh meat: beef, mutton/goat, chicken, duck", type: "radio", required: true, options: yesNoOptions },
  { id: "B10", label: "Eggs: chicken, duck, quail or other eggs", type: "radio", required: true, options: yesNoOptions },
  { id: "B11", label: "Fish and seafood: fresh/dried fish, shrimp, crab", type: "radio", required: true, options: yesNoOptions },
  { id: "B12", label: "Legumes, nuts and seeds: dal, lentils, beans, chickpeas, peanuts", type: "radio", required: true, options: yesNoOptions },
  { id: "B13", label: "Milk and milk products: milk, yoghurt, cheese, excluding milk in tea", type: "radio", required: true, options: yesNoOptions },
  { id: "B14", label: "Oils and fats: oil, ghee, butter used in cooking", type: "radio", required: true, options: yesNoOptions },
  { id: "B15", label: "Sweets: sugar/honey, sweets, cake, sweet drinks", type: "radio", required: true, options: yesNoOptions },
  { id: "B16", label: "Spices, condiments and beverages: spices, sauces, tea/coffee, alcohol", type: "radio", required: true, options: yesNoOptions },
];

export const surveySections: SurveySection[] = [
  {
    id: "consent",
    title: "Consent",
    description:
      "Please read before continuing: The information collected in this survey will be used only for academic research on healthy eating, double burden of malnutrition, and BMI among adults. Your responses will be analyzed in summary form. The data will not be used for any personal, commercial, or harmful purpose, and your personal identity will not be published. Participation is voluntary, and you may stop at any time.",
    fields: [
      { id: "C0", label: "I have read the information above and agree to participate", type: "radio", required: true, options: yesNoOptions },
    ],
  },
  {
    id: "metadata",
    title: "Respondent Metadata",
    fields: [
      { id: "respondentId", label: "Respondent ID", type: "text", required: true },
      { id: "date", label: "Date (DD/MM/YY)", type: "text", required: true },
      { id: "districtArea", label: "District / Area", type: "text", required: true },
      { id: "interviewerCode", label: "Interviewer Code", type: "text", required: true },
    ],
  },
  {
    id: "sociodemographic",
    title: "A. Sociodemographic and Anthropometry",
    fields: [
      { id: "A1", label: "Age (completed years)", type: "number", required: true, unit: "years", min: 0, max: 120 },
      { id: "A2", label: "Sex", type: "radio", required: true, options: [{ label: "Male [0]", value: "0" }, { label: "Female [1]", value: "1" }, { label: "Other [2]", value: "2" }] },
      { id: "A3", label: "Religion", type: "radio", required: true, options: [{ label: "Islam [0]", value: "0" }, { label: "Hinduism [1]", value: "1" }, { label: "Christian [2]", value: "2" }, { label: "Buddhism [3]", value: "3" }, { label: "Other [4]", value: "4" }] },
      { id: "A4", label: "Occupation", type: "radio", required: true, options: [{ label: "Student [1]", value: "1" }, { label: "Service [2]", value: "2" }, { label: "Business [3]", value: "3" }, { label: "Unemployed [4]", value: "4" }, { label: "Other [5]", value: "5" }, { label: "Homemaker [6]", value: "6" }, { label: "Labour [7]", value: "7" }, { label: "Agriculture [8]", value: "8" }] },
      { id: "A5", label: "Personal monthly income (BDT)", type: "radio", required: true, options: [{ label: "None [0]", value: "0" }, { label: "<=10k [1]", value: "1" }, { label: "10,001-20k [2]", value: "2" }, { label: "20,001-40k [3]", value: "3" }, { label: ">40k [4]", value: "4" }] },
      { id: "A6", label: "Marital status", type: "radio", required: true, options: [{ label: "Unmarried [1]", value: "1" }, { label: "Married [2]", value: "2" }, { label: "Divorced/separated [3]", value: "3" }, { label: "Widowed [4]", value: "4" }] },
      { id: "A7", label: "Education", type: "radio", required: true, options: [{ label: "None [0]", value: "0" }, { label: "Primary [1]", value: "1" }, { label: "SSC [2]", value: "2" }, { label: "HSC [3]", value: "3" }, { label: "Graduate [4]", value: "4" }, { label: "Postgraduate [5]", value: "5" }] },
      { id: "A8", label: "Family size", type: "number", required: true, unit: "persons", min: 1 },
      { id: "A9", label: "Total monthly family income (BDT)", type: "radio", required: true, options: [{ label: "<=10k [0]", value: "0" }, { label: "10,001-20k [1]", value: "1" }, { label: "20,001-40k [2]", value: "2" }, { label: ">40k [3]", value: "3" }] },
      { id: "A10", label: "Family type", type: "radio", required: true, options: [{ label: "Nuclear [0]", value: "0" }, { label: "Joint/extended [1]", value: "1" }] },
      { id: "A11", label: "Food insecurity, past 4 weeks", type: "radio", required: true, options: [{ label: "Absent [0]", value: "0" }, { label: "Present [1]", value: "1" }] },
      { id: "A12", label: "Residence", type: "radio", required: true, options: [{ label: "Rural [0]", value: "0" }, { label: "Urban [1]", value: "1" }, { label: "Semi-urban [2]", value: "2" }, { label: "Slum [3]", value: "3" }] },
      { id: "A13", label: "Smoking status", type: "radio", required: true, options: [{ label: "Never [0]", value: "0" }, { label: "Former [1]", value: "1" }, { label: "Current [2]", value: "2" }] },
      { id: "A14", label: "If biologically applicable, currently", type: "radio", required: true, options: [{ label: "Neither [0]", value: "0" }, { label: "Pregnant [1]", value: "1" }, { label: "Lactating [2]", value: "2" }, { label: "N/A [9]", value: "9" }] },
      { id: "A15", label: "Height", type: "number", required: true, unit: "ft + inch", min: 80, max: 250 },
      { id: "A16", label: "Weight", type: "number", required: true, unit: "kg", min: 20, max: 300 },
    ],
  },
  {
    id: "dietaryDiversity",
    title: "B. FANTA/FAO Dietary Diversity - 24h Recall",
    description: "Ask for all foods/drinks eaten yesterday; probe mixed-dish ingredients. This is dietary diversity, not HEI scoring.",
    fields: dietaryDiversityFields,
  },
  {
    id: "mealPatterns",
    title: "C. Meal Patterns and Eating Behaviours",
    fields: [
      { id: "C1", label: "Main meals/day", type: "radio", required: true, options: [{ label: "1 [1]", value: "1" }, { label: "2 [2]", value: "2" }, { label: "3 [3]", value: "3" }, { label: ">=4 [4]", value: "4" }] },
      { id: "C2", label: "Eats breakfast within 2h of waking", type: "radio", required: true, options: yesNoOptions },
      { id: "C3", label: "Days/week skips at least one main meal", type: "number", required: true, unit: "/7", min: 0, max: 7 },
      { id: "C4", label: "Home-cooked vs outside food", type: "radio", required: true, options: [{ label: "Mostly home [0]", value: "0" }, { label: "Equal [1]", value: "1" }, { label: "Mostly outside [2]", value: "2" }] },
      { id: "C5", label: "Access to clean, safe drinking water", type: "radio", required: true, options: yesNoOptions },
      { id: "C6", label: "Plain water consumed daily", type: "number", required: true, unit: "cups/day", min: 0 },
      { id: "C7", label: "Prescribed/self-selected diet pattern", type: "radio", required: true, options: yesNoOptions },
      { id: "C7_pattern", label: "If yes, which pattern", type: "checkboxes", options: [{ label: "Vegetarian", value: "vegetarian" }, { label: "Low-salt", value: "low_salt" }, { label: "Diabetic", value: "diabetic" }, { label: "Weight-loss", value: "weight_loss" }, { label: "Other", value: "other" }] },
      { id: "C8", label: "Late-night meals/snacks after 9 PM", type: "radio", required: true, options: frequencyF2Options },
      { id: "C9", label: "Snacks between main meals", type: "radio", required: true, options: frequencyF2Options },
      { id: "C10", label: "Eats meals at about the same time each day", type: "radio", required: true, options: [{ label: "Rarely / irregular [0]", value: "0" }, { label: "Sometimes [1]", value: "1" }, { label: "Mostly regular [2]", value: "2" }, { label: "Always regular [3]", value: "3" }] },
      { id: "C11", label: "Eats while watching TV or using a phone/laptop", type: "radio", required: true, options: frequencyF2Options },
      { id: "C12", label: "Usually eats main meals", type: "radio", required: true, options: [{ label: "Alone [0]", value: "0" }, { label: "With family [1]", value: "1" }, { label: "With friends/roommates [2]", value: "2" }, { label: "Varies [3]", value: "3" }] },
    ],
  },
  {
    id: "psychosocial",
    title: "D. Psychosocial and Mental-Health Factors",
    fields: [
      { id: "D1", label: "Felt down, depressed or hopeless, past 2 weeks", type: "radio", required: true, options: twoWeekFrequencyOptions },
      { id: "D2", label: "Felt nervous, anxious or on edge, past 2 weeks", type: "radio", required: true, options: twoWeekFrequencyOptions },
      { id: "D3", label: "Overall stress, past month", type: "radio", required: true, options: [{ label: "None [0]", value: "0" }, { label: "Low [1]", value: "1" }, { label: "Moderate [2]", value: "2" }, { label: "High [3]", value: "3" }, { label: "Very high [4]", value: "4" }] },
      { id: "D4", label: "Eats more than planned when stressed/upset", type: "radio", required: true, options: noSometimesYesOptions },
      { id: "D5", label: "Positive relationship with food", type: "radio", required: true, options: noSometimesYesOptions },
      { id: "D6", label: "Sleep per night", type: "number", required: true, unit: "hours", min: 0, max: 24 },
      { id: "D7", label: "Typical sitting time while awake", type: "number", required: true, unit: "hours/day", min: 0, max: 24 },
      { id: "D8", label: "Physical activity", type: "radio", required: true, options: [{ label: "No exercise [0]", value: "0" }, { label: "Mild [1]", value: "1" }, { label: "Moderate [2]", value: "2" }, { label: "Extreme [3]", value: "3" }] },
      { id: "D9", label: "Overall sleep quality, past month", type: "radio", required: true, options: [{ label: "Very poor [0]", value: "0" }, { label: "Poor [1]", value: "1" }, { label: "Fair [2]", value: "2" }, { label: "Good [3]", value: "3" }, { label: "Very good [4]", value: "4" }] },
      { id: "D10", label: "Eats less or skips meals when feeling low or anxious", type: "radio", required: true, options: noSometimesYesOptions },
      { id: "D11", label: "Perceives own current body weight as", type: "radio", required: true, options: [{ label: "Underweight [0]", value: "0" }, { label: "About right [1]", value: "1" }, { label: "Overweight [2]", value: "2" }, { label: "Don't know [9]", value: "9" }] },
      { id: "D12", label: "Support from family or friends when needed", type: "radio", required: true, options: [{ label: "None [0]", value: "0" }, { label: "A little [1]", value: "1" }, { label: "Some [2]", value: "2" }, { label: "A lot [3]", value: "3" }] },
    ],
  },
];
