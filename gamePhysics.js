export function paddleCrossing(previousX, previousY, ballX, ballY, ballSize, previousPaddle, paddle, paddleWidth) {
  const previousBottom = previousY + ballSize;
  const currentBottom = ballY + ballSize;
  const previousSeparation = previousPaddle.y - previousBottom;
  const currentSeparation = paddle.y - currentBottom;
  if (currentBottom <= previousBottom || previousSeparation < 0 || currentSeparation > 0 ||
      currentSeparation >= previousSeparation) {
    return null;
  }

  const fraction = previousSeparation / (previousSeparation - currentSeparation);
  const crossingX = previousX + (ballX - previousX) * fraction;
  const paddleX = previousPaddle.x + (paddle.x - previousPaddle.x) * fraction;
  return crossingX + ballSize >= paddleX && crossingX <= paddleX + paddleWidth
    ? { ballX: crossingX, paddleX }
    : null;
}

export function serveBallY(ballX, ballY, ballSize, paddleX, paddleY, paddleWidth, paddleHeight) {
  const overlapsX = ballX + ballSize >= paddleX && ballX <= paddleX + paddleWidth;
  const overlapsY = ballY + ballSize >= paddleY && ballY <= paddleY + paddleHeight;
  return overlapsX && overlapsY ? paddleY - ballSize : ballY;
}
