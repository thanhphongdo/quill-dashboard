import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function SwitchTheme() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  return (
    <ActionIcon
      onClick={() => setColorScheme(colorScheme === "light" ? "dark" : "light")}
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      {colorScheme === "dark" && <IconSun stroke={1.5} />}
      {colorScheme === "light" && <IconMoon stroke={1.5} />}
    </ActionIcon>
  );
}
