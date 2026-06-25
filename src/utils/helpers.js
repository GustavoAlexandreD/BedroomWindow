export function verificaLimites(camX, camY, camZ, positionX, positionY, positionZ){
    return  (camX >= positionX - 30.0 && camX <= positionX + 30.0) &&
            (camY >= positionY - 30.0 && camY <= positionY + 30.0) &&
            (camZ >= positionZ - 30.0 && camZ <= positionZ + 30.0);
}