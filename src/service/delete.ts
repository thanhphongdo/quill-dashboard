import { NotificationData } from "@mantine/notifications";

export function deleteFamily({
  apiUrl,
  name,
  id,
  callback,
  notifications,
}: {
  apiUrl: string;
  name: string;
  id: string;
  callback: (id: string) => void;
  notifications: {
    show: (props: NotificationData) => void;
  };
}) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "text/plain");

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(`${apiUrl}/data/${name}/${id}`, requestOptions as RequestInit)
    .then((response) => response.text())
    .then((result) => {
      callback(id);
      notifications.show({
        title: "Delete success",
        message: "Data deleted successfully",
        color: "green",
        position: "top-right",
      });
    })
    .catch((error) => {
      notifications.show({
        title: "Delete failed",
        message: "Server Error",
        color: "red",
        position: "top-right",
      });
    });
}
