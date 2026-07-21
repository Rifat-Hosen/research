export type SurveyOption = {
  label: string;
  value: string;
};

export type SurveyFieldType =
  | "text"
  | "email"
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

const yesNoDontKnowOptions: SurveyOption[] = [
  { label: "No [0]", value: "0" },
  { label: "Yes [1]", value: "1" },
  { label: "Don't know [9]", value: "9" },
];

const frequencyF1Options: SurveyOption[] = [
  { label: "Never [0]", value: "0" },
  { label: "1-2 days/week [1]", value: "1" },
  { label: "3-4 days/week [2]", value: "2" },
  { label: "5-6 days/week [3]", value: "3" },
  { label: "Daily [4]", value: "4" },
  { label: "Don't know [9]", value: "9" },
];

const frequencyF2Options: SurveyOption[] = [
  { label: "Never [0]", value: "0" },
  { label: "1-2 days/week [1]", value: "1" },
  { label: "3-4 days/week [2]", value: "2" },
  { label: "5-6 days/week [3]", value: "3" },
  { label: "Daily [4]", value: "4" },
];

const agreementOptions: SurveyOption[] = [
  { label: "Strongly disagree [1]", value: "1" },
  { label: "Disagree [2]", value: "2" },
  { label: "Neutral [3]", value: "3" },
  { label: "Agree [4]", value: "4" },
  { label: "Strongly agree [5]", value: "5" },
];

const dietaryDiversityFields: SurveyField[] = [
  { id: "E1", label: "Cereals: rice, wheat/atta, maize, bread, noodles", type: "radio", required: true, options: yesNoOptions },
  { id: "E2", label: "White roots and tubers: potato, white yam/cassava, taro", type: "radio", required: true, options: yesNoOptions },
  { id: "E3", label: "Vitamin A-rich vegetables/tubers: pumpkin, carrot, orange sweet potato", type: "radio", required: true, options: yesNoOptions },
  { id: "E4", label: "Dark green leafy vegetables: spinach, amaranth, mustard/moringa", type: "radio", required: true, options: yesNoOptions },
  { id: "E5", label: "Other vegetables: tomato, onion, eggplant, cabbage", type: "radio", required: true, options: yesNoOptions },
  { id: "E6", label: "Vitamin A-rich fruits: ripe mango/papaya, cantaloupe", type: "radio", required: true, options: yesNoOptions },
  { id: "E7", label: "Other fruits: banana, apple, guava, citrus", type: "radio", required: true, options: yesNoOptions },
  { id: "E8", label: "Organ meat: liver, kidney, heart, other offal", type: "radio", required: true, options: yesNoOptions },
  { id: "E9", label: "Flesh meat: beef, mutton/goat, chicken, duck", type: "radio", required: true, options: yesNoOptions },
  { id: "E10", label: "Eggs: chicken, duck, quail or other eggs", type: "radio", required: true, options: yesNoOptions },
  { id: "E11", label: "Fish and seafood: fresh/dried fish, shrimp, crab", type: "radio", required: true, options: yesNoOptions },
  { id: "E12", label: "Legumes, nuts and seeds: dal, lentils, beans, chickpeas, peanuts", type: "radio", required: true, options: yesNoOptions },
  { id: "E13", label: "Milk and milk products: milk, yoghurt, cheese, excluding milk in tea", type: "radio", required: true, options: yesNoOptions },
  { id: "E14", label: "Oils and fats: oil, ghee, butter used in cooking", type: "radio", required: true, options: yesNoOptions },
  { id: "E15", label: "Sweets: sugar/honey, sweets, cake, sweet drinks", type: "radio", required: true, options: yesNoOptions },
  { id: "E16", label: "Spices, condiments and beverages: spices, sauces, tea/coffee, alcohol", type: "radio", required: true, options: yesNoOptions },
];

export const surveySections: SurveySection[] = [
  {
    id: "consent",
    title: "Consent",
    fields: [
      { id: "C0", label: "Consent given", type: "radio", required: true, options: yesNoOptions },
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
    title: "A. Sociodemographic",
    fields: [
      { id: "A1", label: "Name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
      { id: "A2", label: "Age (completed years)", type: "number", required: true, unit: "years", min: 18, max: 120 },
      { id: "A3", label: "Sex", type: "radio", required: true, options: [{ label: "Male [0]", value: "0" }, { label: "Female [1]", value: "1" }, { label: "Other [2]", value: "2" }] },
      { id: "A4", label: "Religion", type: "radio", options: [{ label: "Islam [0]", value: "0" }, { label: "Hinduism [1]", value: "1" }, { label: "Christian [2]", value: "2" }, { label: "Buddhism [3]", value: "3" }, { label: "Other [4]", value: "4" }] },
      { id: "A5", label: "Occupation", type: "radio", options: [{ label: "Service [0]", value: "0" }, { label: "Business [1]", value: "1" }, { label: "Agriculture [2]", value: "2" }, { label: "Labour [3]", value: "3" }, { label: "Homemaker [4]", value: "4" }, { label: "Student [5]", value: "5" }, { label: "Unemployed [6]", value: "6" }, { label: "Other [7]", value: "7" }] },
      { id: "A6", label: "Personal monthly income (BDT)", type: "radio", options: [{ label: "None [0]", value: "0" }, { label: "<=10k [1]", value: "1" }, { label: "10,001-20k [2]", value: "2" }, { label: "20,001-40k [3]", value: "3" }, { label: ">40k [4]", value: "4" }] },
      { id: "A7", label: "Marital status", type: "radio", options: [{ label: "Married [0]", value: "0" }, { label: "Unmarried [1]", value: "1" }, { label: "Divorced/separated [2]", value: "2" }, { label: "Widowed [3]", value: "3" }] },
      { id: "A8", label: "Education", type: "radio", options: [{ label: "None [0]", value: "0" }, { label: "Primary [1]", value: "1" }, { label: "SSC [2]", value: "2" }, { label: "HSC [3]", value: "3" }, { label: "Graduate [4]", value: "4" }, { label: "Postgraduate [5]", value: "5" }] },
      { id: "A9", label: "Family size", type: "number", unit: "persons", min: 1 },
      { id: "A10", label: "Total monthly family income (BDT)", type: "radio", options: [{ label: "<=10k [0]", value: "0" }, { label: "10,001-20k [1]", value: "1" }, { label: "20,001-40k [2]", value: "2" }, { label: ">40k [3]", value: "3" }] },
      { id: "A11", label: "Family type", type: "radio", options: [{ label: "Nuclear [0]", value: "0" }, { label: "Joint/extended [1]", value: "1" }] },
      { id: "A12", label: "Food insecurity, past 4 weeks", type: "radio", options: [{ label: "Absent [0]", value: "0" }, { label: "Present [1]", value: "1" }] },
      { id: "A13", label: "Residence", type: "radio", options: [{ label: "Rural [0]", value: "0" }, { label: "Urban [1]", value: "1" }, { label: "Semi-urban [2]", value: "2" }, { label: "Slum [3]", value: "3" }] },
      { id: "A14", label: "Smoking status", type: "radio", options: [{ label: "Never [0]", value: "0" }, { label: "Former [1]", value: "1" }, { label: "Current [2]", value: "2" }] },
      { id: "A15", label: "If biologically applicable, currently", type: "radio", options: [{ label: "Neither [0]", value: "0" }, { label: "Pregnant [1]", value: "1" }, { label: "Lactating [2]", value: "2" }, { label: "N/A [9]", value: "9" }] },
    ],
  },
  {
    id: "anthropometry",
    title: "B. Anthropometry and BMI",
    fields: [
      { id: "B1", label: "Height", type: "number", required: true, unit: "cm", min: 80, max: 250 },
      { id: "B2", label: "Weight", type: "number", required: true, unit: "kg", min: 20, max: 300 },
      { id: "B4", label: "Energy requirement", type: "number", unit: "kcal/day" },
      { id: "B5", label: "Energy intake", type: "number", unit: "kcal/day" },
      { id: "B6", label: "Waist circumference", type: "number", unit: "cm" },
      { id: "B7", label: "Mid-upper arm circumference", type: "number", unit: "cm" },
      { id: "B8", label: "Blood pressure", type: "text", unit: "mmHg" },
    ],
  },
  {
    id: "heiFoodGroups",
    title: "C. HEI Food-Group Consumption",
    fields: [
      { id: "C1", label: "Unintentional weight loss, past 3-6 months", type: "radio", options: yesNoOptions },
      { id: "C2", label: "Days in past 7 eating whole fruits, not juice", type: "number", unit: "/7", min: 0, max: 7 },
      { id: "C3", label: "Servings of 100% fruit juice per day", type: "number", unit: "servings/day", min: 0 },
      { id: "C4", label: "Days in past 7 eating non-starchy vegetables", type: "number", unit: "/7", min: 0, max: 7 },
      { id: "C5", label: "Dark green leafy vegetables", type: "radio", options: frequencyF1Options },
      { id: "C6", label: "Cooked dried beans, lentils or peas", type: "radio", options: frequencyF1Options },
      { id: "C7", label: "Whole grains: brown rice, oats, millet", type: "radio", options: frequencyF1Options },
      { id: "C8", label: "Refined grains: white rice/bread, biscuits", type: "radio", options: frequencyF1Options },
      { id: "C9", label: "Dairy: milk, yoghurt, cheese", type: "radio", options: frequencyF1Options },
      { id: "C10", label: "Lean protein: chicken, fish, eggs, tofu", type: "radio", options: frequencyF1Options },
      { id: "C11", label: "Processed/preserved meat: sausage, canned", type: "radio", options: frequencyF1Options },
    ],
  },
  {
    id: "heiFatsSodiumSugars",
    title: "D. HEI Fats, Sodium and Sugars",
    fields: [
      { id: "D1", label: "Primary cooking fat/oil", type: "radio", options: [{ label: "Soy [0]", value: "0" }, { label: "Mustard [1]", value: "1" }, { label: "Palm [2]", value: "2" }, { label: "Rice bran [3]", value: "3" }, { label: "Ghee/butter [4]", value: "4" }, { label: "Other [5]", value: "5" }] },
      { id: "D2", label: "Deep-fried foods", type: "radio", options: frequencyF1Options },
      { id: "D3", label: "Fast food / commercial processed meals", type: "radio", options: frequencyF1Options },
      { id: "D4", label: "Adds extra salt at table or cooking", type: "radio", options: frequencyF1Options },
      { id: "D5", label: "Sugar-sweetened beverages", type: "radio", options: frequencyF1Options },
      { id: "D6", label: "Sweets, cakes, pastries or confectionery", type: "radio", options: frequencyF1Options },
      { id: "D7", label: "Nuts, seeds or nut butters", type: "radio", options: frequencyF1Options },
      { id: "D8", label: "Fatty fish: hilsa, mackerel, sardine", type: "radio", options: frequencyF1Options },
      { id: "D9", label: "Reads nutrition/ingredient labels", type: "radio", options: [{ label: "Never [0]", value: "0" }, { label: "Sometimes [1]", value: "1" }, { label: "Usually [2]", value: "2" }, { label: "N/A [9]", value: "9" }] },
    ],
  },
  {
    id: "dietaryDiversity",
    title: "E. FANTA/FAO Dietary Diversity - 24h Recall",
    description: "Ask for all foods/drinks eaten yesterday; probe mixed-dish ingredients. This is dietary diversity, not HEI scoring.",
    fields: dietaryDiversityFields,
  },
  {
    id: "mealPatterns",
    title: "F. Meal Patterns and Eating Behaviours",
    fields: [
      { id: "F1", label: "Main meals/day", type: "radio", options: [{ label: "1 [1]", value: "1" }, { label: "2 [2]", value: "2" }, { label: "3 [3]", value: "3" }, { label: ">=4 [4]", value: "4" }] },
      { id: "F2", label: "Eats breakfast within 2h of waking", type: "radio", options: yesNoOptions },
      { id: "F3", label: "Days/week skips at least one main meal", type: "number", unit: "/7", min: 0, max: 7 },
      { id: "F4", label: "Home-cooked vs outside food", type: "radio", options: [{ label: "Mostly home [0]", value: "0" }, { label: "Equal [1]", value: "1" }, { label: "Mostly outside [2]", value: "2" }] },
      { id: "F5", label: "Access to clean, safe drinking water", type: "radio", options: yesNoOptions },
      { id: "F6", label: "Plain water consumed daily", type: "number", unit: "cups/day", min: 0 },
      { id: "F7", label: "Prescribed/self-selected diet pattern", type: "checkboxes", options: [{ label: "Vegetarian", value: "vegetarian" }, { label: "Low-salt", value: "low_salt" }, { label: "Diabetic", value: "diabetic" }, { label: "Weight-loss", value: "weight_loss" }, { label: "Other", value: "other" }] },
      { id: "F8", label: "Late-night meals/snacks after 9 PM", type: "radio", options: frequencyF2Options },
      { id: "F9", label: "Snacks between main meals", type: "radio", options: frequencyF2Options },
    ],
  },
  {
    id: "doubleBurden",
    title: "G. Double Burden of Malnutrition",
    fields: [
      { id: "G1", label: "Previously diagnosed undernutrition / PEM / wasting", type: "radio", options: yesNoDontKnowOptions },
      { id: "G2", label: "Ever diagnosed micronutrient-deficiency anaemia", type: "radio", options: yesNoDontKnowOptions },
      { id: "G3", label: "Significant fatigue, weakness, poor wound healing", type: "radio", options: yesNoDontKnowOptions },
      { id: "G4", label: "Current/history food insecurity", type: "radio", options: yesNoDontKnowOptions },
      { id: "G5", label: "Adequate dietary protein, assessor estimate", type: "radio", options: [{ label: "Inadequate [0]", value: "0" }, { label: "Adequate [1]", value: "1" }, { label: "Unclear [9]", value: "9" }] },
      { id: "G6", label: "Clinically diagnosed Type 2 diabetes", type: "radio", options: yesNoDontKnowOptions },
      { id: "G7", label: "Diagnosed hypertension (BP >=140/90)", type: "radio", options: yesNoDontKnowOptions },
      { id: "G8", label: "Current/prior cardiovascular disease", type: "radio", options: yesNoDontKnowOptions },
      { id: "G9", label: "Feels consumes more calories than needed", type: "radio", options: [{ label: "Never [0]", value: "0" }, { label: "Sometimes [1]", value: "1" }, { label: "Often [2]", value: "2" }, { label: "Don't know [9]", value: "9" }] },
      { id: "G10", label: "Takes medicine for diabetes/hypertension/lipids", type: "radio", options: yesNoOptions },
      { id: "G11", label: "Other diagnosed condition affecting diet/weight", type: "radio", options: yesNoOptions },
    ],
  },
  {
    id: "physicalActivity",
    title: "H. Physical Activity and Sedentary Behaviour",
    fields: [
      { id: "H1_days", label: "Days/week moderate-intensity activity", type: "number", unit: "/7", min: 0, max: 7 },
      { id: "H1_minutes", label: "Average moderate activity minutes/day", type: "number", unit: "min/day", min: 0 },
      { id: "H2_days", label: "Days/week vigorous-intensity activity", type: "number", unit: "/7", min: 0, max: 7 },
      { id: "H2_minutes", label: "Average vigorous activity minutes/day", type: "number", unit: "min/day", min: 0 },
      { id: "H3", label: "Typical sitting/reclining time while awake", type: "number", unit: "hours/day", min: 0, max: 24 },
    ],
  },
  {
    id: "enumeratorChecks",
    title: "X. Field Enumerator Checks",
    fields: [
      { id: "X1", label: "Interview language", type: "radio", options: [{ label: "Bangla [0]", value: "0" }, { label: "English [1]", value: "1" }, { label: "Other [2]", value: "2" }] },
      { id: "X2", label: "Recall day unusual: feast, fasting, illness, travel", type: "radio", options: yesNoOptions },
      { id: "X3", label: "Form complete and reviewed", type: "radio", options: yesNoOptions },
    ],
  },
  {
    id: "psychosocial",
    title: "I. Psychosocial and Mental-Health Factors",
    fields: [
      { id: "I1", label: "Felt down, depressed or hopeless, past 2 weeks", type: "radio", options: [{ label: "Not at all [0]", value: "0" }, { label: "Several days [1]", value: "1" }, { label: ">half the days [2]", value: "2" }, { label: "Nearly every day [3]", value: "3" }] },
      { id: "I2", label: "Felt nervous, anxious or on edge, past 2 weeks", type: "radio", options: [{ label: "Not at all [0]", value: "0" }, { label: "Several days [1]", value: "1" }, { label: ">half the days [2]", value: "2" }, { label: "Nearly every day [3]", value: "3" }] },
      { id: "I3", label: "Overall stress, past month", type: "radio", options: [{ label: "None [0]", value: "0" }, { label: "Low [1]", value: "1" }, { label: "Moderate [2]", value: "2" }, { label: "High [3]", value: "3" }, { label: "Very high [4]", value: "4" }] },
      { id: "I4", label: "Eats more than planned when stressed/upset", type: "radio", options: [{ label: "No [0]", value: "0" }, { label: "Sometimes [1]", value: "1" }, { label: "Yes [2]", value: "2" }] },
      { id: "I5", label: "Positive relationship with food", type: "radio", options: [{ label: "No [0]", value: "0" }, { label: "Sometimes [1]", value: "1" }, { label: "Yes [2]", value: "2" }] },
      { id: "I6", label: "Sleep per night", type: "number", unit: "hours", min: 0, max: 24 },
    ],
  },
  {
    id: "nutritionKnowledge",
    title: "J. Nutrition Knowledge, Attitudes and Self-Efficacy",
    fields: [
      { id: "J1", label: "I understand what a balanced diet means and which food groups should be included.", type: "radio", options: agreementOptions },
      { id: "J2", label: "I know the recommended daily servings of fruits and vegetables for an adult.", type: "radio", options: agreementOptions },
      { id: "J3", label: "I can identify foods high in saturated fat, added sugar or sodium on a label.", type: "radio", options: agreementOptions },
      { id: "J4", label: "I understand the link between poor diet and chronic diseases like diabetes/heart disease.", type: "radio", options: agreementOptions },
      { id: "J5", label: "Good nutrition is a priority for me compared with other aspects of daily life.", type: "radio", options: agreementOptions },
    ],
  },
  {
    id: "notes",
    title: "Notes and Office Scoring",
    fields: [
      { id: "notes", label: "Enumerator / assessor comments", type: "textarea" },
      { id: "heiScore", label: "HEI score, manual office scoring only", type: "number", unit: "/100", min: 0, max: 100 },
    ],
  },
];
