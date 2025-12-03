import { Layout } from "../components/layouts/Layout";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  JsonInput,
  Modal,
  ScrollArea,
  Table,
  Title,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import {
  IconColumns,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { update } from "../service/update";
import { create } from "../service/create";
import { PortalSlot } from "../components/PortalSlot";
import { deleteFamily } from "../service/delete";

const FamilyDataViewer = memo(
  ({
    filter,
    displayColumns,
  }: {
    filter?: string;
    displayColumns?: string[];
  }) => {
    const apiUrl = useQuillDashboardStore((state) => state.apiUrl);
    const currentFamily = useQuillDashboardStore(
      (state) => state.currentFamily
    );
    const currentData = useQuillDashboardStore((state) => state.currentData);
    const setCurrentData = useQuillDashboardStore(
      (state) => state.setCurrentData
    );
    const fetchData = useQuillDashboardStore((state) => state.fetchData);
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

    const [selectedData, setSelectedData] = useState<any>(null);

    const [
      openedUpdateModal,
      { open: openUpdateModal, close: closeUpdateModal },
    ] = useDisclosure(false);
    const [
      openedCreateModal,
      { open: openCreateModal, close: closeCreateModal },
    ] = useDisclosure(false);
    const [
      openedDeleteModal,
      { open: openDeleteModal, close: closeDeleteModal },
    ] = useDisclosure(false);

    const jsonInputUpdateRef = useRef<HTMLTextAreaElement>(null);
    const jsonInputCreateRef = useRef<HTMLTextAreaElement>(null);

    const onUpdate = useCallback((data: any) => {
      setSelectedData(data);
      openUpdateModal();
    }, []);

    return (
      <div className="py-0 h-[calc(100vh_-_144px)] max-w-full overflow-auto">
        <Table style={{ width: "100%", borderCollapse: "collapse" }}>
          <Table.Thead className="sticky top-0 bg-[var(--mantine-color-body)]">
            {table.getHeaderGroups().map((hg) => (
              <Table.Tr key={hg.id}>
                <Table.Th className="p-2 border-b border-gray-200 sticky left-0 bg-[var(--mantine-color-body)]">
                  <div className="w-12">No.</div>
                </Table.Th>
                <Table.Th className="p-2 border-b border-gray-200 sticky left-[68px] bg-[var(--mantine-color-body)]">
                  <div className="flex flex-col items-start gap-1 min-w-24">
                    <span className="font-bold">ID</span>
                    <span className="font-bold text-gray-400">number</span>
                  </div>
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
                <Table.Th className="p-2 border-b border-gray-200 sticky right-0 bg-[var(--mantine-color-body)]">
                  Actions
                </Table.Th>
              </Table.Tr>
            ))}
          </Table.Thead>

          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td className="p-2 border-b border-gray-200 font-bold sticky left-0 bg-[var(--mantine-color-body)]">
                  {row.index + 1}
                </Table.Td>
                <Table.Td className="p-2 border-b border-gray-200 font-bold sticky left-[68px] bg-[var(--mantine-color-body)]">
                  {row.original.id}
                </Table.Td>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td
                    key={cell.id}
                    className="p-2 border-b border-gray-200"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
                <Table.Td className="p-2 border-b border-gray-200 sticky !right-0 bg-[var(--mantine-color-body)]">
                  <div className="flex gap-2">
                    <IconEdit
                      className="cursor-pointer text-orange-300"
                      onClick={() => {
                        onUpdate(row.original);
                      }}
                    />
                    <IconTrash
                      className="cursor-pointer text-red-500"
                      onClick={() => {
                        openDeleteModal();
                        setSelectedData(row.original);
                      }}
                    />
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Modal
          size={"lg"}
          opened={openedUpdateModal}
          onClose={closeUpdateModal}
          title={
            <Title order={4}>
              <div className="flex gap-1">
                <span>Edit </span>
                <span className="font-bold text-orange-500">
                  {currentFamily?.displaynames}
                </span>
                <span> - </span>
                <span>ID:</span>
                <span className="font-bold text-orange-500">
                  {selectedData?.id}
                </span>
              </div>
            </Title>
          }
        >
          <div className="flex flex-col gap-2">
            <JsonInput
              ref={jsonInputUpdateRef}
              styles={{
                input: {
                  height: "500px",
                },
              }}
              minRows={20}
              defaultValue={JSON.stringify(
                { ...selectedData, id: undefined },
                null,
                4
              )}
            />
          </div>

          <Group
            className="sticky bottom-0 bg-[var(--mantine-color-body)] py-4"
            mt="lg"
            justify="flex-end"
          >
            <Button
              color="green"
              onClick={async () => {
                if (!jsonInputUpdateRef.current) return;
                update({
                  apiUrl,
                  name: currentFamily?.name ?? "",
                  id: selectedData.id,
                  params: jsonInputUpdateRef.current.value,
                  callback: (updatedData) => {
                    setCurrentData(
                      currentData?.map((item) => {
                        if (item.id === selectedData.id) {
                          return {
                            ...item,
                            ...updatedData,
                          };
                        }
                        return item;
                      }) ?? []
                    );
                    closeUpdateModal();
                  },
                  notifications,
                });
              }}
            >
              Save
            </Button>
            <Button color="red" onClick={closeUpdateModal}>
              Close
            </Button>
          </Group>
        </Modal>

        <PortalSlot slotId="open-create-modal">
          <Button onClick={openCreateModal} color="green">
            <IconPlus />
          </Button>
        </PortalSlot>

        <Modal
          size={"lg"}
          opened={openedCreateModal}
          onClose={closeCreateModal}
          title={
            <Title order={4}>
              <div className="flex gap-1">
                <span>Create new </span>
                <span className="font-bold text-orange-500">
                  {currentFamily?.displaynames}
                </span>
              </div>
            </Title>
          }
        >
          <div className="flex flex-col gap-2">
            <JsonInput
              ref={jsonInputCreateRef}
              styles={{
                input: {
                  height: "500px",
                },
              }}
              minRows={20}
              defaultValue={JSON.stringify(
                { ...selectedData, id: undefined },
                null,
                4
              )}
            />
          </div>

          <Group
            className="sticky bottom-0 bg-[var(--mantine-color-body)] py-4"
            mt="lg"
            justify="flex-end"
          >
            <Button
              color="green"
              onClick={async () => {
                if (!jsonInputCreateRef.current) return;
                create({
                  apiUrl,
                  name: currentFamily?.name ?? "",
                  params: jsonInputCreateRef.current.value,
                  callback: () => {
                    fetchData("");
                    closeCreateModal();
                  },
                  notifications,
                });
              }}
            >
              Save
            </Button>
            <Button color="red" onClick={closeCreateModal}>
              Close
            </Button>
          </Group>
        </Modal>
        <Modal
          size={"lg"}
          opened={openedDeleteModal}
          onClose={closeDeleteModal}
          title={
            <Title order={4}>
              <div className="flex gap-1">
                <span>Delete </span>
                <span className="font-bold text-orange-500">
                  {currentFamily?.displaynames}
                </span>
                <span> - </span>
                <span>ID:</span>
                <span className="font-bold text-orange-500">
                  {selectedData?.id}
                </span>
              </div>
            </Title>
          }
        >
          <div className="flex flex-col gap-2">Are you sure to delete?</div>

          <Group
            className="sticky bottom-0 bg-[var(--mantine-color-body)] py-4"
            mt="lg"
            justify="flex-end"
          >
            <Button
              color="green"
              onClick={async () => {
                deleteFamily({
                  apiUrl,
                  name: currentFamily?.name ?? "",
                  id: selectedData.id,
                  callback: (id) => {
                    setCurrentData(
                      currentData?.filter((item) => item.id !== id) ?? []
                    );
                    closeDeleteModal();
                  },
                  notifications,
                });
              }}
            >
              Confirm
            </Button>
            <Button color="red" onClick={closeDeleteModal}>
              Close
            </Button>
          </Group>
        </Modal>
      </div>
    );
  }
);

export const Home = () => {
  const currentFamily = useQuillDashboardStore((state) => state.currentFamily);
  const apiUrl = useQuillDashboardStore((state) => state.apiUrl);
  const fetchData = useQuillDashboardStore((state) => state.fetchData);

  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const queryStringRef = useRef<HTMLInputElement>(null);
  const [displayColumns, setDisplayColumns] = useState<string[]>(
    currentFamily?.fields?.map((f) => f.name) ?? []
  );

  const [debouncedDisplayColumns] = useDebouncedValue(displayColumns, 500);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    setDisplayColumns(currentFamily?.fields?.map((f) => f.name) ?? []);
  }, [currentFamily]);

  return (
    <Layout>
      {!!currentFamily?.fields?.length && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center px-4">
            <div className="flex-1">
              <Title order={3}>{currentFamily?.displaynames}</Title>
            </div>
            <Input
              placeholder="Filter"
              onChange={(e) => setFilter(e.target.value)}
            />
            <Input
              placeholder="Fill Query String and Press Enter"
              className="w-96"
              ref={queryStringRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchData(queryStringRef.current?.value ?? "");
                }
              }}
              rightSection={<IconSearch />}
            />

            <Button onClick={open}>
              <IconColumns />
            </Button>
            <div id="open-create-modal"></div>
          </div>
          <div className="p-4">
            <FamilyDataViewer
              filter={debouncedFilter}
              displayColumns={debouncedDisplayColumns}
            />
          </div>
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
          <Checkbox
            label="All"
            checked={displayColumns.length === currentFamily?.fields?.length}
            onChange={(e) => {
              if (e.target.checked) {
                setDisplayColumns(
                  currentFamily?.fields?.map((f) => f.name) ?? []
                );
              } else {
                setDisplayColumns([]);
              }
            }}
          />
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
