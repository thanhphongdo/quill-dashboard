import { NotificationData } from "@mantine/notifications";

export function update({
  apiUrl,
  name,
  id,
  params,
  callback,
  notifications,
}: {
  apiUrl: string;
  name: string;
  id: string;
  params: string;
  callback: (updatedData: any) => void;
  notifications: {
    show: (props: NotificationData) => void;
  };
}) {
  if (!params) return;
  try {
    JSON.parse(params.trim());
  } catch {
    notifications.show({
      title: "Update failed",
      message: "Cannot parse JSON",
      color: "red",
      position: "top-right",
    });
  }
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "text/plain");

  const raw = params;

  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(`${apiUrl}/data/${name}/${id}`, requestOptions as RequestInit)
    .then((response) => response.text())
    .then((result) => {
      const updatedData = JSON.parse(raw ?? "{}");
      callback(updatedData);
      notifications.show({
        title: "Update success",
        message: "Data updated successfully",
        color: "green",
        position: "top-right",
      });
    })
    .catch((error) => {
      notifications.show({
        title: "Update failed",
        message: "Server Error",
        color: "red",
        position: "top-right",
      });
    });
}
