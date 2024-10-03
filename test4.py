import cv2

# Khởi tạo kết nối RTSP server
server_url = "rtsp://localhost:8554/live"
cap = cv2.VideoCapture(server_url)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow('frame', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
