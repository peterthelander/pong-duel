/**
 * @param {number} previousX
 * @param {number} previousY
 * @param {number} ballX
 * @param {number} ballY
 * @param {number} ballSize
 * @param {{x: number, y: number}} previousPaddle
 * @param {{x: number, y: number}} paddle
 * @param {number} paddleWidth
 * @returns {{ballX: number, paddleX: number} | null}
 */
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

/**
 * Detect an upward-moving ball crossing the underside of a top paddle.
 * @param {number} previousX
 * @param {number} previousY
 * @param {number} ballX
 * @param {number} ballY
 * @param {number} ballSize
 * @param {{x: number, y: number}} previousPaddle
 * @param {{x: number, y: number}} paddle
 * @param {number} paddleWidth
 * @param {number} paddleHeight
 * @returns {{ballX: number, paddleX: number} | null}
 */
export function topPaddleCrossing(previousX, previousY, ballX, ballY, ballSize, previousPaddle, paddle, paddleWidth, paddleHeight) {
  return paddleCrossing(
    previousX, -previousY - ballSize, ballX, -ballY - ballSize, ballSize,
    { x: previousPaddle.x, y: -previousPaddle.y - paddleHeight },
    { x: paddle.x, y: -paddle.y - paddleHeight }, paddleWidth
  );
}

/**
 * @param {number} ballVelocityY
 * @param {number} previousPaddleY
 * @param {number} paddleY
 * @param {number} elapsedSeconds
 * @returns {number}
 */
export function playerBounceVelocity(ballVelocityY, previousPaddleY, paddleY, elapsedSeconds) {
  const upwardSpeed = elapsedSeconds > 0 ? Math.max(0, (previousPaddleY - paddleY) / elapsedSeconds) : 0;
  const boost = Math.min(350, upwardSpeed * 0.7);
  return -(Math.abs(ballVelocityY) * 1.03 + boost);
}

/**
 * @param {number} ballX
 * @param {number} ballY
 * @param {number} ballSize
 * @param {number} paddleX
 * @param {number} paddleY
 * @param {number} paddleWidth
 * @param {number} paddleHeight
 * @returns {number}
 */
export function serveBallY(ballX, ballY, ballSize, paddleX, paddleY, paddleWidth, paddleHeight) {
  const overlapsX = ballX + ballSize >= paddleX && ballX <= paddleX + paddleWidth;
  const overlapsY = ballY + ballSize >= paddleY && ballY <= paddleY + paddleHeight;
  return overlapsX && overlapsY ? paddleY - ballSize : ballY;
}
