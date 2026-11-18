export function createTouchController(twoPlayer) {
  const owners = new Map();
  const occupied = { top: null, bottom: null };

  return {
    start(touches, arena, move) {
      for (const touch of touches) {
        if (owners.has(touch.identifier)) continue;
        const side = touch.locationY < arena.height / 2 ? 'top' : 'bottom';
        if ((!twoPlayer && side === 'top') || occupied[side] !== null) continue;
        owners.set(touch.identifier, side);
        occupied[side] = touch.identifier;
        move(side, touch.locationX, touch.locationY);
      }
    },
    move(touches, move) {
      for (const touch of touches) {
        const side = owners.get(touch.identifier);
        if (side) move(side, touch.locationX, touch.locationY);
      }
    },
    end(touches) {
      for (const touch of touches) {
        const side = owners.get(touch.identifier);
        if (side) {
          occupied[side] = null;
          owners.delete(touch.identifier);
        }
      }
    },
    clear() {
      owners.clear();
      occupied.top = null;
      occupied.bottom = null;
    },
  };
}
