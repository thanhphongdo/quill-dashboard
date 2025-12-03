import { NotificationData } from "@mantine/notifications";

export function create({
  apiUrl,
  name,
  params,
  callback,
  notifications,
}: {
  apiUrl: string;
  name: string;
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
      title: "Create failed",
      message: "Cannot parse JSON",
      color: "red",
      position: "top-right",
    });
  }
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "text/plain");

  const raw = params;

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(`${apiUrl}/data/${name}`, requestOptions as RequestInit)
    .then((response) => response.text())
    .then((result) => {
      const updatedData = JSON.parse(raw ?? "{}");
      callback(updatedData);
      notifications.show({
        title: "Create success",
        message: "Data created successfully",
        color: "green",
        position: "top-right",
      });
    })
    .catch((error) => {
      notifications.show({
        title: "Create failed",
        message: "Server Error",
        color: "red",
        position: "top-right",
      });
    });
}
