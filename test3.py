import cv2
import subprocess as sp
import numpy as np

# Khởi tạo camera
cap = cv2.VideoCapture(0)

# Thiết lập thông tin video
fps = 20
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Thiết lập giao thức RTSP server với FFmpeg
ffmpeg_cmd = [
    'ffmpeg',
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-pix_fmt', 'bgr24',
    '-s', '{}x{}'.format(width, height),
    '-r', str(fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'ultrafast',
    '-f', 'flv', 'rtmp://localhost:1935/live/webcam'  # Stream to RTMP server
]

# Khởi chạy FFmpeg process
ffmpeg_process = sp.Popen(ffmpeg_cmd, stdin=sp.PIPE)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Gửi frame đến FFmpeg process để xử lý
    ffmpeg_process.stdin.write(frame.tobytes())

    # Hiển thị frame
    cv2.imshow('frame', frame)

    # Nhấn 'q' để thoát
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Kết thúc FFmpeg process và giải phóng tài nguyên
ffmpeg_process.stdin.close()
ffmpeg_process.wait()
cap.release()
cv2.destroyAllWindows()
