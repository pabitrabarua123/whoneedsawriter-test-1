"use client";

import React from "react";
import {
  Button,
  Text,
  Flex,
  Container,
  Heading,
  VStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
} from "@chakra-ui/react";
import {
  TbArrowDown,
  TbArrowUp,
  TbDots,
} from "react-icons/tb";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryClient } from "@/app/providers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, format } from "date-fns";
import DashboardHeader from "@/components/organisms/DashboardHeader/DashboardHeader";
import { useRouter } from "next/navigation";

type BatchData = {
  id: string;
  name: string;
  articles: number;
  completed_articles: number;
  pending_articles: number;
  failed_articles: number;
  status: number;
  articleType: string;
  model: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type KeywordRecord = {
  id: string;
  website_url: string | null;
  description: string | null;
  seedKeyword: string | null;
  goal: string | null;
  json: string | null;
  createdAt: string;
};

const GenerationHistory: React.FC = () => {
  const router = useRouter();

  // Article batches
  const {
    data: batchData,
    isLoading: isLoadingBatches,
    error: batchError,
  } = useQuery({
    queryKey: ["batch"],
    queryFn: async () => {
      const response = await fetch("/api/article-generator/batch");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: true,
  });

  const batches: BatchData[] = batchData?.batch || [];

  const batchColumnHelper = createColumnHelper<BatchData>();
  const batchColumns = [
    batchColumnHelper.accessor("name", {
      cell: ({ row }) => (
        <Text size="sm" border="none">
          <a href={`/articles?batchId=${row.original.id}`}>{row.original.name}</a>
        </Text>
      ),
      header: "Batch",
    }),
    {
      id: "articleType",
      header: "Article Type",
      cell: ({ row }: { row: Row<BatchData> }) => {
        const displayValue = row.original.model || row.original.articleType;

        const formatArticleType = (type: string | null) => {
          if (!type) return "N/A";
          if (type === "godmode") return "God Mode";
          if (type === "liteMode") return "Lite Mode";

          return type
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        };

        return <div>{formatArticleType(displayValue)}</div>;
      },
    },
    {
      id: "articles",
      header: "Articles Generated",
      cell: ({ row }: { row: Row<BatchData> }) => (
        <div>{row.original.articles}</div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: Row<BatchData> }) => {
        const status =
          row.original.status === 0
            ? "In progress"
            : row.original.completed_articles >= row.original.articles
            ? "Completed"
            : row.original.completed_articles === 0
            ? "Failed"
            : "Partially completed";

        const statusColor =
          status === "Completed"
            ? "green.500"
            : status === "Partially completed"
            ? "orange.500"
            : status === "In progress"
            ? "blue.500"
            : "red.500";

        return (
          <Text color={statusColor} fontWeight="medium">
            {status}
          </Text>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }: { column: Column<any> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            size="sm"
          >
            Created
            {column.getIsSorted() === "desc" && (
              <TbArrowDown className="ml-2 h-4 w-4" />
            )}
            {column.getIsSorted() === "asc" && (
              <TbArrowUp className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }: { row: Row<BatchData> }) => {
        const date = new Date(row.original.createdAt);
        const now = new Date();
        const diffInHours =
          (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        const formattedDate =
          diffInHours <= 24
            ? formatDistanceToNow(date, { addSuffix: true }).replace(
                "about ",
                ""
              )
            : format(date, "MM/dd/yyyy");

        return <div className="lowercase">{formattedDate}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: Row<BatchData> }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <TbDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/articles?batchId=${row.original.id}`)
                }
              >
                View Articles
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(row.original)}
              >
                Delete Batch
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [batchSorting, setBatchSorting] = React.useState<SortingState>([]);
  const [batchColumnFilters, setBatchColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [batchColumnVisibility, setBatchColumnVisibility] =
    React.useState<VisibilityState>({});
  const [batchRowSelection, setBatchRowSelection] = React.useState({});

  const batchTable = useReactTable({
    data: batches,
    columns: batchColumns as ColumnDef<BatchData>[],
    onSortingChange: setBatchSorting,
    onColumnFiltersChange: setBatchColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setBatchColumnVisibility,
    onRowSelectionChange: setBatchRowSelection,
    enableSortingRemoval: true,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
    state: {
      sorting: batchSorting,
      columnFilters: batchColumnFilters,
      columnVisibility: batchColumnVisibility,
      rowSelection: batchRowSelection,
    },
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [batchToDelete, setBatchToDelete] = React.useState<BatchData | null>(
    null
  );

  const openDeleteDialog = (batch: BatchData) => {
    setBatchToDelete(batch);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setBatchToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  // Keyword generations
  const {
    data: keywordData,
    isLoading: isLoadingKeywords,
    error: keywordError,
  } = useQuery({
    queryKey: ["keyword-history"],
    queryFn: async () => {
      const response = await fetch("/api/keyword-research/history");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json() as Promise<{ keywords: KeywordRecord[] }>;
    },
  });

  const keywords: KeywordRecord[] = keywordData?.keywords || [];

  const keywordColumnHelper = createColumnHelper<KeywordRecord>();
  const keywordColumns = [
    keywordColumnHelper.accessor("id", {
      cell: ({ row }) => (
        <Text size="sm" border="none">
          {row.original.id}
        </Text>
      ),
      header: "Generation ID",
    }),
    {
      id: "topic",
      header: "Topic",
      cell: ({ row }: { row: Row<KeywordRecord> }) => {
        const topic = row.original.seedKeyword || row.original.website_url;
        return <Text>{topic || "-"}</Text>;
      },
    },
    {
      id: "keywordsGenerated",
      header: "Keywords Generated",
      cell: ({ row }: { row: Row<KeywordRecord> }) => {
        const { json } = row.original;
        let count = 0;

        if (json) {
          try {
            const parsed: any = JSON.parse(json);
            if (Array.isArray(parsed)) {
              count = parsed.length;
            } else if (Array.isArray(parsed?.keywords)) {
              count = parsed.keywords.length;
            } else if (Array.isArray(parsed?.data)) {
              count = parsed.data.length;
            }
          } catch {
            count = 0;
          }
        }

        return <Text>{count > 0 ? count : "-"}</Text>;
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: Row<KeywordRecord> }) => {
        const status = row.original.json ? "Completed" : "In progress";
        const color = row.original.json ? "green.500" : "yellow.500";
        return (
          <Text color={color} fontWeight="medium">
            {status}
          </Text>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <TbDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem disabled>
                More actions coming soon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [keywordSorting, setKeywordSorting] = React.useState<SortingState>(
    []
  );
  const [keywordColumnFilters, setKeywordColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [keywordColumnVisibility, setKeywordColumnVisibility] =
    React.useState<VisibilityState>({});
  const [keywordRowSelection, setKeywordRowSelection] = React.useState({});

  const keywordTable = useReactTable({
    data: keywords,
    columns: keywordColumns as ColumnDef<KeywordRecord>[],
    onSortingChange: setKeywordSorting,
    onColumnFiltersChange: setKeywordColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setKeywordColumnVisibility,
    onRowSelectionChange: setKeywordRowSelection,
    enableSortingRemoval: true,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
    state: {
      sorting: keywordSorting,
      columnFilters: keywordColumnFilters,
      columnVisibility: keywordColumnVisibility,
      rowSelection: keywordRowSelection,
    },
  });

  return (
    <Flex justifyContent="flex-start" w="100%" minH="100vh">
      <div className="flex-col w-full">
        <DashboardHeader />
        <Container
          px="27px"
          pt={["15px", "15px", "96px"]}
          alignItems="flex-center"
          maxWidth="1050px"
          mb="56px"
        >
          <VStack align="flex-start" spacing={4} w="100%">
            <Heading size="md">Generation History</Heading>
            <Text className="text-slate-500 text-sm">
              Review your article batches and keyword generations.
            </Text>

            <Tabs variant="enclosed" w="100%">
              <TabList>
                <Tab>Articles</Tab>
                <Tab>Keywords</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  {batchError && (
                    <Text color="red.500">
                      An error occurred: {batchError.message}
                    </Text>
                  )}
                  <Box className="w-full">
                    <Table className="rounded-md border  w-full">
                      <TableHeader>
                        {batchTable.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead
                                  key={header.id}
                                  className="text-center"
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {batchTable.getRowModel().rows?.length ? (
                          batchTable.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              data-state={
                                row.getIsSelected() && "selected"
                              }
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell
                                  key={cell.id}
                                  className="text-center"
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={batchColumns.length}
                              className="h-24 text-center"
                            >
                              {isLoadingBatches
                                ? "Loading..."
                                : "No results."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-end space-x-2 py-4">
                      <div className="flex-1 text-sm text-muted-foreground">
                        Page {batchTable.getState().pagination.pageIndex + 1} of{" "}
                        {batchTable.getPageCount()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => batchTable.previousPage()}
                          disabled={!batchTable.getCanPreviousPage()}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => batchTable.nextPage()}
                          disabled={!batchTable.getCanNextPage()}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </Box>
                </TabPanel>
                <TabPanel px={0}>
                  {keywordError && (
                    <Text color="red.500">
                      An error occurred: {keywordError.message}
                    </Text>
                  )}
                  <Box className="w-full">
                    <Table className="rounded-md border  w-full">
                      <TableHeader>
                        {keywordTable.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead
                                  key={header.id}
                                  className="text-center"
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {keywordTable.getRowModel().rows?.length ? (
                          keywordTable.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              data-state={
                                row.getIsSelected() && "selected"
                              }
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell
                                  key={cell.id}
                                  className="text-center"
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={keywordColumns.length}
                              className="h-24 text-center"
                            >
                              {isLoadingKeywords
                                ? "Loading..."
                                : "No results."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-end space-x-2 py-4">
                      <div className="flex-1 text-sm text-muted-foreground">
                        Page{" "}
                        {keywordTable.getState().pagination.pageIndex + 1} of{" "}
                        {keywordTable.getPageCount()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => keywordTable.previousPage()}
                          disabled={!keywordTable.getCanPreviousPage()}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => keywordTable.nextPage()}
                          disabled={!keywordTable.getCanNextPage()}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>

          <DeleteBatchDialog
            batch={batchToDelete || undefined}
            isOpen={isDeleteDialogOpen}
            onClose={closeDeleteDialog}
          />
        </Container>
      </div>
    </Flex>
  );
};

export default GenerationHistory;

type DeleteBatchDialogProps = {
  batch: BatchData | undefined;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBatchDialog: React.FC<DeleteBatchDialogProps> = ({
  batch,
  isOpen,
  onClose,
}) => {
  const deleteBatchMutation = useMutation({
    mutationFn: async (batchId: string) => {
      const response = await fetch("/api/article-generator/batch", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: batchId }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete batch");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Batch deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["batch"] });
      onClose();
    },
    onError: () => {
      toast.error("Error deleting batch");
    },
  });

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
            <br />
            This will permanently delete the batch{" "}
            <strong>{batch?.name}</strong> and all its articles.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteBatchMutation.mutate(batch?.id || "");
            }}
            disabled={deleteBatchMutation.isPending}
          >
            {deleteBatchMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

