const decodeToken = (token) => {
  const base64Url = token.split('.')[1]; // Obtener el payload del token
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Reemplazos necesarios para decodificar
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  
  const decodedToken = JSON.parse(jsonPayload); // Retornar el payload en formato JSON

  // Verificar si el token ha expirado
  const currentTime = Date.now() / 1000; // Tiempo actual en segundos
  if (decodedToken.exp < currentTime) {
    throw new Error('El token ha expirado');
  }

  return decodedToken;
};

export default decodeToken;
