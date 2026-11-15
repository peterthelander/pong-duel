export function paddleCrossingX(previousX, previousY, ballX, ballY, ballSize, paddleX, paddleY, paddleWidth) {
  const previousBottom = previousY + ballSize;
  const currentBottom = ballY + ballSize;
  if (currentBottom <= previousBottom || previousBottom > paddleY || currentBottom < paddleY) {
    return null;
  }

  const fraction = (paddleY - previousBottom) / (currentBottom - previousBottom);
  const crossingX = previousX + (ballX - previousX) * fraction;
  return crossingX + ballSize >= paddleX && crossingX <= paddleX + paddleWidth ? crossingX : null;
}

export function serveBallY(ballX, ballY, ballSize, paddleX, paddleY, paddleWidth, paddleHeight) {
  const overlapsX = ballX + ballSize >= paddleX && ballX <= paddleX + paddleWidth;
  const overlapsY = ballY + ballSize >= paddleY && ballY <= paddleY + paddleHeight;
  return overlapsX && overlapsY ? paddleY - ballSize : ballY;
}
