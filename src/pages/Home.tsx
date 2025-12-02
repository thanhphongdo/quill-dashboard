import { Layout } from "../components/layouts/Layout";

import React, { memo, useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuillDashboardStore } from "../stores/store";
import {
  Button,
  Checkbox,
  Group,
  Input,
  Modal,
  ScrollArea,
  Table,
  Title,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { IconColumns } from "@tabler/icons-react";

const FamilyDataViewer = memo(
  ({
    filter,
    displayColumns,
  }: {
    filter?: string;
    displayColumns?: string[];
  }) => {
    const currentFamily = useQuillDashboardStore(
      (state) => state.currentFamily
    );
    const currentData = useQuillDashboardStore((state) => state.currentData);
    const data = useMemo(() => {
      const filterLower = filter?.toLowerCase() ?? "";

      return (currentData ?? []).filter((d) => {
        const text = Object.values(d)
          .filter((v) => v != null)
          .join(" ")
          .toLowerCase();

        return text.includes(filterLower);
      });
    }, [currentData, filter]);

    const columns: ColumnDef<any>[] = useMemo(() => {
      return [
        { colorder: 0, name: "id", typename: "number" },
        ...currentFamily!.fields.filter((f) =>
          (!!displayColumns?.length
            ? displayColumns
            : currentFamily!.fields.map((f) => f.name)
          )?.includes(f.name)
        ),
      ]
        .sort((a, b) => (a.colorder ?? 10000) - (b.colorder ?? 10000))
        .map((field) => ({
          accessorKey: field.name,
          header: () => (
            <div className="flex flex-col items-start gap-1 min-w-48">
              <span className="font-bold">{field.name}</span>
              <span className="font-bold text-gray-400">{field.typename}</span>
            </div>
          ),
          cell: ({ getValue }) => (
            <div>
              {getValue() === null && <span className="italic">-</span>}
              {typeof getValue() === "boolean" && (
                <span>{getValue() ? "True" : "False"}</span>
              )}
              {typeof getValue() !== "string" && (
                <span>{getValue() as string}</span>
              )}
              {typeof getValue() !== "number" && (
                <span>{getValue() as string}</span>
              )}
            </div>
          ),
        }));
    }, [currentFamily?.fields, displayColumns]);

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="p-4 max-w-full overflow-auto">
        <Table style={{ width: "100%", borderCollapse: "collapse" }}>
          <Table.Thead>
            {table.getHeaderGroups().map((hg) => (
              <Table.Tr key={hg.id}>
                <Table.Th className="p-2 border-b border-gray-200">
                  No.
                </Table.Th>
                {hg.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    className="p-2 border-b border-gray-200"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>

          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td className="p-2 border-b border-gray-200 font-bold">
                  {row.index + 1}
                </Table.Td>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td
                    key={cell.id}
                    className="p-2 border-b border-gray-200"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    );
  }
);

export const Home = () => {
  const currentFamily = useQuillDashboardStore((state) => state.currentFamily);
  const fetchData = useQuillDashboardStore((state) => state.fetchData);

  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const queryStringRef = useRef<HTMLInputElement>(null);
  const [displayColumns, setDisplayColumns] = useState<string[]>(
    currentFamily?.fields.map((f) => f.name) ?? []
  );
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Layout>
      {!!currentFamily?.fields?.length && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Input
              placeholder="Query String"
              className="w-96"
              ref={queryStringRef}
            />
            <Button
              onClick={() => {
                fetchData(queryStringRef.current?.value ?? "");
              }}
            >
              Apply
            </Button>
            <Button onClick={open}>
              <IconColumns />
            </Button>
            <div className="flex-1"></div>
            <Input
              placeholder="Filter"
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <FamilyDataViewer
            filter={debouncedFilter}
            displayColumns={displayColumns}
          />
        </div>
      )}
      <Modal
        size={"lg"}
        opened={opened}
        onClose={close}
        title={<Title order={4}>Column Settings</Title>}
        scrollAreaComponent={ScrollArea.Autosize}
        styles={{
          body: {
            paddingBottom: 0,
          },
        }}
      >
        <div className="flex flex-col gap-2">
          {currentFamily?.fields
            ?.sort((a, b) => (a.colorder ?? 10000) - (b.colorder ?? 10000))
            .map((field) => (
              <Checkbox
                key={field.name}
                label={field.name}
                checked={displayColumns.includes(field.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setDisplayColumns([...displayColumns, field.name]);
                  } else {
                    setDisplayColumns(
                      displayColumns.filter((c) => c !== field.name)
                    );
                  }
                }}
              />
            ))}
        </div>

        <Group
          className="sticky bottom-0 bg-[var(--mantine-color-body)] py-4"
          mt="lg"
          justify="flex-end"
        >
          <Button color="red" onClick={close}>
            Close
          </Button>
        </Group>
      </Modal>
    </Layout>
  );
};
