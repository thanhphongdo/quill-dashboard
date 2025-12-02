import {
  AppShell,
  Burger,
  Button,
  Drawer,
  Group,
  Input,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PropsWithChildren, useEffect, useRef } from "react";
import { SwitchTheme } from "../SwitchTheme";
import { useNavigate } from "react-router";
import { useQuillDashboardStore } from "../../stores/store";

export function Layout({ children }: PropsWithChildren) {
  const [opened, { toggle, close }] = useDisclosure();
  const navigate = useNavigate();
  const apiUrl = useQuillDashboardStore((state) => state.apiUrl);
  const families = useQuillDashboardStore((state) => state.families);
  const currentFamily = useQuillDashboardStore((state) => state.currentFamily);
  const setApiUrl = useQuillDashboardStore((state) => state.setApiUrl);
  const setFamilies = useQuillDashboardStore((state) => state.setFamilies);
  const fetchData = useQuillDashboardStore((state) => state.fetchData);
  const setCurrentFamily = useQuillDashboardStore(
    (state) => state.setCurrentFamily
  );
  const urlRef = useRef<HTMLInputElement>(null);

  const connect = async () => {
    if (urlRef.current) {
      setApiUrl(urlRef.current.value);
    }
  };

  useEffect(() => {
    fetch(`${apiUrl}/families`).then(async (res) => {
      setFamilies(await res.json());
    });
  }, [apiUrl]);

  useEffect(() => {
    fetchData("");
  }, [currentFamily]);

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <div className="flex items-center justify-center w-full relative">
            <Burger
              className="absolute z-20 left-0"
              opened={opened}
              onClick={toggle}
              size="sm"
            />
            <div className="flex-1 flex gap-4 pl-12">
              <Text
                size="xl"
                fw={600}
                className="font-fredoka cursor-pointer"
                onClick={() => navigate("/")}
              >
                Quill Dashboard
              </Text>
              <div className="w-96 flex gap-4">
                <Input
                  placeholder="API URL"
                  className="flex-1"
                  defaultValue={apiUrl}
                  ref={urlRef}
                />
                <Button onClick={() => connect()}>Connect</Button>
              </div>
            </div>
            <div className="absolute right-0 top-0">
              <SwitchTheme />
            </div>
          </div>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
      <Drawer
        opened={opened}
        onClose={close}
        title={<Title order={3}>Families</Title>}
      >
        <div className="flex flex-col gap-2">
          {families.map((family) => (
            <div key={family.id} className="flex gap-4">
              {family.icon && (
                <img
                  src={`data:image/svg+xml;base64,${btoa(family.icon)}`}
                  alt="svg"
                  className="bg-gray-400/50 rounded-md p-1"
                />
              )}
              <Title
                className="cursor-pointer"
                order={4}
                onClick={async () => {
                  setCurrentFamily(family);
                  fetch(`${apiUrl}/families/${family.id}/fields`).then(
                    async (res) => {
                      const fields = await res.json();
                      setCurrentFamily({
                        ...family,
                        fields,
                      });
                      // fetchData("");
                    }
                  );
                }}
              >
                <span>{family.displaynames}</span>
              </Title>
            </div>
          ))}
        </div>
      </Drawer>
    </AppShell>
  );
}
