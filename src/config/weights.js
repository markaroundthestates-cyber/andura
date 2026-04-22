export const DUMBBELL_WEIGHTS = [7,8,9,10,12.5,15,17.5,20,22.5,25,27.5,30,32.5,35,37.5,40,42.5,45,47.5,50];
export const CABLE_WEIGHTS = [5,7.5,10,12.5,15,17.5,20,22.5,25,27.5,30,32.5,35,37.5,40,42.5,45,47.5,50,55,60,65,70,75,80];
export const MACHINE_WEIGHTS = [10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,90,100,110,120,130,140,150,160];

export const EXERCISE_EQUIPMENT_TYPE = {
  'Incline DB Press':'dumbbell','DB Shoulder Press':'dumbbell','Lateral Raises':'dumbbell',
  'Lateral Raises + drop':'dumbbell','Incline DB Curl':'dumbbell','Rear Delt Fly':'dumbbell',
  'Flat DB Press':'dumbbell','Hammer Curl':'dumbbell',
  'Bayesian Curl':'cable','Cable Row':'cable','Face Pulls':'cable','Lat Pulldown':'cable',
  'Overhead Triceps':'cable','Pushdown':'cable','Pec Deck / Cable Fly':'cable',
  'Cable Fly':'cable','Lateral Raises (cable)':'cable','Rear Delt Cable':'cable','Cable Curl':'cable',
  'Leg Press':'machine','Leg Extension':'machine','Leg Curl':'machine','Chest-Supported Row':'machine',
};

function getList(type) {
  if (type === 'dumbbell') return DUMBBELL_WEIGHTS;
  if (type === 'cable') return CABLE_WEIGHTS;
  if (type === 'machine') return MACHINE_WEIGHTS;
  return CABLE_WEIGHTS;
}

export function getNextWeight(current, exerciseName) {
  const type = EXERCISE_EQUIPMENT_TYPE[exerciseName] || 'cable';
  const list = getList(type);
  const idx = list.findIndex(w => w >= current);
  if (idx < 0) return list[list.length-1];
  if (list[idx] === current) return list[Math.min(idx+1, list.length-1)];
  return list[idx];
}

export function getPrevWeight(current, exerciseName) {
  const type = EXERCISE_EQUIPMENT_TYPE[exerciseName] || 'cable';
  const list = getList(type);
  const idx = list.findIndex(w => w >= current);
  if (idx <= 0) return list[0];
  return list[idx-1];
}

export function roundToEquipmentWeight(kg, exerciseName) {
  const type = EXERCISE_EQUIPMENT_TYPE[exerciseName] || 'cable';
  const list = getList(type);
  return list.reduce((prev, curr) => Math.abs(curr - kg) < Math.abs(prev - kg) ? curr : prev);
}
