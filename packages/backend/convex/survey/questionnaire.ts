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
  { label: "More than half the days [2]", value: "2" },
  { label: "Nearly every day [3]", value: "3" },
];

const noSometimesYesOptions: SurveyOption[] = [
  { label: "No [0]", value: "0" },
  { label: "Sometimes [1]", value: "1" },
  { label: "Yes [2]", value: "2" },
];

const dietaryDiversityFields: SurveyField[] = [
  { id: "B1", label: "Cereals: rice, wheat/atta, maize, bread, noodles (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B2", label: "White roots and tubers: potato, white yam/cassava, taro (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B3", label: "Vitamin A-rich vegetables/tubers: pumpkin, carrot, orange sweet potato (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B4", label: "Dark green leafy vegetables: spinach, amaranth, mustard/moringa (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B5", label: "Other vegetables: tomato, onion, eggplant, cabbage (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B6", label: "Vitamin A-rich fruits: ripe mango/papaya, cantaloupe (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B7", label: "Other fruits: banana, apple, guava, citrus (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B8", label: "Organ meat: liver, kidney, heart, other offal (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B9", label: "Flesh meat: beef, mutton/goat, chicken, duck (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B10", label: "Eggs: chicken, duck, quail or other eggs (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B11", label: "Fish and seafood: fresh/dried fish, shrimp, crab (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B12", label: "Legumes, nuts and seeds: dal, lentils, beans, chickpeas, peanuts (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B13", label: "Milk and milk products: milk, yoghurt, cheese, excluding milk in tea (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B14", label: "Oils and fats: oil, ghee, butter used in cooking (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B15", label: "Sweets: sugar/honey, sweets, cake, sweet drinks (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
  { id: "B16", label: "Spices, condiments and beverages: spices, sauces, tea/coffee, alcohol (last 24 hr)", type: "radio", required: true, options: yesNoOptions },
];

export const surveySections: SurveySection[] = [
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
    title: "A. About You and Your Household",
    fields: [
      { id: "A1", label: "How old are you? (completed years)", type: "number", required: true, min: 0, max: 120 },
      { id: "A2", label: "What is your sex?", type: "radio", required: true, options: [{ label: "Male [0]", value: "0" }, { label: "Female [1]", value: "1" }, { label: "Other [2]", value: "2" }] },
      { id: "A3", label: "What is your religion?", type: "radio", required: true, options: [{ label: "Islam [0]", value: "0" }, { label: "Hinduism [1]", value: "1" }, { label: "Christian [2]", value: "2" }, { label: "Buddhism [3]", value: "3" }, { label: "Other [4]", value: "4" }] },
      { id: "A4", label: "What is your main occupation?", type: "radio", required: true, options: [{ label: "Student [1]", value: "1" }, { label: "Service [2]", value: "2" }, { label: "Business [3]", value: "3" }, { label: "Unemployed [4]", value: "4" }, { label: "Other [5]", value: "5" }, { label: "Homemaker [6]", value: "6" }, { label: "Labour [7]", value: "7" }, { label: "Agriculture [8]", value: "8" }] },
      { id: "A5", label: "Your own monthly income (BDT)", type: "radio", required: true, options: [{ label: "None [0]", value: "0" }, { label: "Up to 10,000 [1]", value: "1" }, { label: "10,001 - 20,000 [2]", value: "2" }, { label: "20,001 - 40,000 [3]", value: "3" }, { label: "More than 40,000 [4]", value: "4" }] },
      { id: "A6", label: "What is your marital status?", type: "radio", required: true, options: [{ label: "Unmarried [1]", value: "1" }, { label: "Married [2]", value: "2" }, { label: "Divorced/separated [3]", value: "3" }, { label: "Widowed [4]", value: "4" }] },
      { id: "A7", label: "Highest level of education you completed", type: "radio", required: true, options: [{ label: "None [0]", value: "0" }, { label: "Primary [1]", value: "1" }, { label: "SSC [2]", value: "2" }, { label: "HSC [3]", value: "3" }, { label: "Graduate [4]", value: "4" }, { label: "Postgraduate [5]", value: "5" }] },
      { id: "A8", label: "How many people live in your household?", type: "number", required: true, unit: "persons", min: 1 },
      { id: "A9", label: "Total monthly income of your whole family (BDT)", type: "radio", required: true, options: [{ label: "Up to 10,000 [0]", value: "0" }, { label: "10,001 - 20,000 [1]", value: "1" }, { label: "20,001 - 40,000 [2]", value: "2" }, { label: "More than 40,000 [3]", value: "3" }] },
      { id: "A10", label: "Who do you live with?", type: "radio", required: true, options: [{ label: "Small family (parents and children) [0]", value: "0" }, { label: "Joint or extended family [1]", value: "1" }] },
      { id: "A11", label: "In the last 4 weeks, was there any time your household did not have enough food?", type: "radio", required: true, options: [{ label: "No [0]", value: "0" }, { label: "Yes [1]", value: "1" }] },
      { id: "A12", label: "Where do you live?", type: "radio", required: true, options: [{ label: "Rural [0]", value: "0" }, { label: "Urban [1]", value: "1" }, { label: "Semi-urban [2]", value: "2" }, { label: "Slum [3]", value: "3" }] },
      { id: "A13", label: "Do you smoke?", type: "radio", required: true, options: [{ label: "Never smoked [0]", value: "0" }, { label: "Used to, but stopped [1]", value: "1" }, { label: "Yes, currently [2]", value: "2" }] },
      { id: "A14", label: "Are you currently pregnant or breastfeeding?", type: "radio", required: true, options: [{ label: "Neither [0]", value: "0" }, { label: "Pregnant [1]", value: "1" }, { label: "Breastfeeding [2]", value: "2" }, { label: "Does not apply [9]", value: "9" }] },
      { id: "A15", label: "Your height", type: "number", required: true, unit: "ft + inch", min: 80, max: 250 },
      { id: "A16", label: "Your weight", type: "number", required: true, unit: "kg", min: 20, max: 300 },
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
    title: "C. Your Meals and Eating Habits",
    fields: [
      { id: "C1", label: "How many main meals do you eat in a day?", type: "radio", required: true, options: [{ label: "1 [1]", value: "1" }, { label: "2 [2]", value: "2" }, { label: "3 [3]", value: "3" }, { label: "4 or more [4]", value: "4" }] },
      { id: "C2", label: "Do you eat breakfast within 2 hours of waking up?", type: "radio", required: true, options: yesNoOptions },
      { id: "C3", label: "How many days a week do you skip a main meal?", type: "number", required: true, unit: "/7", min: 0, max: 7 },
      { id: "C4", label: "Most of your meals are", type: "radio", required: true, options: [{ label: "Mostly cooked at home [0]", value: "0" }, { label: "About half and half [1]", value: "1" }, { label: "Mostly from outside [2]", value: "2" }] },
      { id: "C5", label: "Do you have access to clean, safe drinking water?", type: "radio", required: true, options: yesNoOptions },
      { id: "C6", label: "How much plain water do you drink in a day?", type: "number", required: true, unit: "L/day", min: 0 },
      { id: "C7", label: "Are you following any special diet (by your own choice or on a doctor's advice)?", type: "radio", required: true, options: yesNoOptions },
      { id: "C7a", label: "If yes, which one?", type: "checkboxes", options: [{ label: "Vegetarian", value: "vegetarian" }, { label: "Low-salt", value: "low_salt" }, { label: "Diabetic", value: "diabetic" }, { label: "Weight-loss", value: "weight_loss" }, { label: "Other", value: "other" }] },
      { id: "C8", label: "How often do you eat a meal or snack after 9 PM?", type: "radio", required: true, options: frequencyF2Options },
      { id: "C9", label: "How often do you snack between main meals?", type: "radio", required: true, options: frequencyF2Options },
      { id: "C10", label: "Do you eat your meals at about the same time each day?", type: "radio", required: true, options: [{ label: "Rarely / irregular [0]", value: "0" }, { label: "Sometimes [1]", value: "1" }, { label: "Mostly regular [2]", value: "2" }, { label: "Always regular [3]", value: "3" }] },
      { id: "C11", label: "How often do you eat while watching TV or using a phone/laptop?", type: "radio", required: true, options: frequencyF2Options },
      { id: "C12", label: "Who do you usually eat your main meals with?", type: "radio", required: true, options: [{ label: "Alone [0]", value: "0" }, { label: "With family [1]", value: "1" }, { label: "With friends/roommates [2]", value: "2" }, { label: "It varies [3]", value: "3" }] },
    ],
  },
  {
    id: "psychosocial",
    title: "D. Wellbeing, Sleep and Activity",
    fields: [
      { id: "D1", label: "In the last 2 weeks, how often have you felt down, depressed or hopeless?", type: "radio", required: true, options: twoWeekFrequencyOptions },
      { id: "D2", label: "In the last 2 weeks, how often have you felt nervous, anxious or on edge?", type: "radio", required: true, options: twoWeekFrequencyOptions },
      { id: "D3", label: "Over the last month, how much stress have you felt overall?", type: "radio", required: true, options: [{ label: "None [0]", value: "0" }, { label: "Low [1]", value: "1" }, { label: "Moderate [2]", value: "2" }, { label: "High [3]", value: "3" }, { label: "Very high [4]", value: "4" }] },
      { id: "D4", label: "Do you eat more than you planned when you feel stressed or upset?", type: "radio", required: true, options: noSometimesYesOptions },
      { id: "D5", label: "Do you feel good about your relationship with food?", type: "radio", required: true, options: noSometimesYesOptions },
      { id: "D6", label: "How many hours do you sleep at night?", type: "number", required: true, unit: "hours", min: 0, max: 24 },
      { id: "D7", label: "On a normal day, how many hours do you spend sitting?", type: "number", required: true, unit: "hours/day", min: 0, max: 24 },
      { id: "D8", label: "How much physical activity or exercise do you do?", type: "radio", required: true, options: [{ label: "No exercise [0]", value: "0" }, { label: "Light [1]", value: "1" }, { label: "Moderate [2]", value: "2" }, { label: "Vigorous [3]", value: "3" }] },
      { id: "D9", label: "Over the last month, how would you rate your sleep overall?", type: "radio", required: true, options: [{ label: "Very poor [0]", value: "0" }, { label: "Poor [1]", value: "1" }, { label: "Fair [2]", value: "2" }, { label: "Good [3]", value: "3" }, { label: "Very good [4]", value: "4" }] },
      { id: "D10", label: "Do you eat less or skip meals when you feel low or anxious?", type: "radio", required: true, options: noSometimesYesOptions },
      { id: "D11", label: "Do you think your current weight is", type: "radio", required: true, options: [{ label: "Underweight [0]", value: "0" }, { label: "About right [1]", value: "1" }, { label: "Overweight [2]", value: "2" }, { label: "Don't know [9]", value: "9" }] },
      { id: "D12", label: "When you need help, how much support do you get from family or friends?", type: "radio", required: true, options: [{ label: "None [0]", value: "0" }, { label: "A little [1]", value: "1" }, { label: "Some [2]", value: "2" }, { label: "A lot [3]", value: "3" }] },
    ],
  },
  {
    id: "consent",
    title: "Consent",
    description:
      "Please read before continuing: The information collected in this survey will be used only for academic research on healthy eating, double burden of malnutrition, and BMI among adults. Your responses will be analyzed in summary form. The data will not be used for any personal, commercial, or harmful purpose, and your personal identity will not be published. Participation is voluntary, and you may stop at any time.",
    fields: [
      { id: "C0", label: "I have read the information above and agree to participate", type: "radio", required: true, options: yesNoOptions },
    ],
  },
];
