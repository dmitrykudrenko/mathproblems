// ⟨Монета радіуса 1 котиться без ковзання навколо нерухомої монети радіуса R, зовні та всередині кільця. Скільки обертів зробить стрілка на ній?|A coin of radius 1 rolls without slipping around a fixed coin of radius R, outside it and inside a ring. How many turns does the arrow on it make?⟩
// ⟨Коло замінено 3600-кутником: на сторонах монета котиться, на кутах повертається навколо вершини.|The circle is replaced by a 3600-gon: on the sides the coin rolls, at the corners it pivots about the vertex.⟩
const N = 3600, r = 1;
function roll(R, inside) {
  const side = 2 * R * Math.sin(Math.PI / N);             // ⟨сторона многокутника|a side of the polygon⟩
  // ⟨всередині монета котиться по зсунутому на r многокутнику, а кутів не торкається|inside, the coin rolls along the polygon shifted in by r and never touches the corners⟩
  const track = inside ? 2 * (R * Math.cos(Math.PI / N) - r) * Math.tan(Math.PI / N) : side;
  let angle = 0, prev = 0, turns = 0;                       // ⟨кут стрілки відносно стола|the arrow's angle relative to the table⟩
  for (let i = 0; i < N; i++) {
    angle += (inside ? -1 : 1) * track / r;                 // ⟨прокотилася на track: поворот track / r|rolled a distance track: a turn of track / r⟩
    if (!inside) angle += 2 * Math.PI / N;                  // ⟨поворот навколо вершини|the pivot about the vertex⟩
    // ⟨рахуємо оберти так, як рахувала б камера над столом: за кутом стрілки|count turns as a camera above the table would: from the arrow's angle⟩
    const a = Math.atan2(Math.sin(angle), Math.cos(angle));
    let d = a - prev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
    turns += d / (2 * Math.PI); prev = a;
  }
  return Math.abs(turns);
}
for (const R of [1, 2, 3, 4, 6]) {
  console.log('R/r =', R, '⟨зовні|outside⟩', roll(R, false).toFixed(4), '⟨формула|formula⟩', R + 1,
    '· ⟨всередині|inside⟩', roll(R, true).toFixed(4), '⟨формула|formula⟩', R - 1);
}
