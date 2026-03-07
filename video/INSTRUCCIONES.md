# Vídeo hero

Descarga el vídeo desde Pexels (libre de derechos):
https://www.pexels.com/video/barber-tools-on-a-mat-7697544/

Pulsa "Free download" y elige la resolución HD (1920×1080).

Guarda el archivo aquí con el nombre exacto:
  video/hero.mp4

¿Por qué es necesario servirlo local?
- iOS Safari bloquea el autoplay de vídeos cross-origin aunque tengan muted + playsinline.
- Al servir el archivo desde el mismo dominio (Vercel) funciona en todos los dispositivos.
- El fallback si el vídeo no carga es la imagen images/local.png con overlay oscuro.
