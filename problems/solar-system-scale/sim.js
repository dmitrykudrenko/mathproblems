// ⟨Земля — 5 см. Ділимо справжні діаметри й відстані на один масштаб і дивимося, якої довжини вийде аркуш.|Earth is 5 cm. Divide the real diameters and distances by one scale and see how long the sheet gets.⟩
// ⟨Діаметри в км (NASA), відстані від Сонця в астрономічних одиницях (JPL).|Diameters in km (NASA), distances from the Sun in astronomical units (JPL).⟩
const AU = 149597870.7, k = 12742 / 5;          // ⟨км в 1 см паперу|km per 1 cm of paper⟩
const bodies = [['⟨Сонце|Sun⟩', 1391400, 0], ['⟨Меркурій|Mercury⟩', 4879, 0.3871], ['⟨Венера|Venus⟩', 12104, 0.7233], ['⟨Земля|Earth⟩', 12742, 1.0000],
  ['⟨Марс|Mars⟩', 6779, 1.5237], ['⟨Юпітер|Jupiter⟩', 139820, 5.2029], ['⟨Сатурн|Saturn⟩', 116460, 9.5367], ['⟨Уран|Uranus⟩', 50724, 19.1892], ['⟨Нептун|Neptune⟩', 49244, 30.0699]];
for (const [name, d, a] of bodies)
  console.log(name.padEnd(9), (d / k).toFixed(1).padStart(6), '⟨см|cm⟩', (a * AU / k / 100).toFixed(0).padStart(6), '⟨м від Сонця|m from the Sun⟩');
const nep = bodies[8], row = (nep[2] * AU + bodies[0][1] / 2 + nep[1] / 2) / k / 1e5;
console.log('⟨Аркуш, планети в ряд:|Sheet, planets in a row:⟩', row.toFixed(2), '⟨км ×|km ×⟩', (bodies[0][1] / k / 100).toFixed(2), '⟨м|m⟩');
