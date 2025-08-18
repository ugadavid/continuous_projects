const cols = 10, cellW = 512, cellH = 512;
let index = 0;
function show(i){
  index = i;
  const x = -(i % cols) * cellW;
  const y = -Math.floor(i / cols) * cellH;
  viewer.style.backgroundPosition = `${x}px ${y}px`;
}
// ex: avancer toutes les 2s
setInterval(()=>show((index+1)%100), 2000);