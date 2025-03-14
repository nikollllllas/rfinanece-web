import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownIcon, ArrowUpIcon, Plus, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: "1",
    description: "Compras de supermercado",
    amount: -120.5,
    date: "2023-06-15",
    category: "Comida",
  },
  {
    id: "2",
    description: "Depósito de salário",
    amount: 2500.0,
    date: "2023-06-10",
    category: "Ganhos",
  },
  {
    id: "3",
    description: "Conta de luz",
    amount: -85.2,
    date: "2023-06-08",
    category: "Utilidades",
  },
  {
    id: "4",
    description: "Pagamento freelance",
    amount: 350.0,
    date: "2023-06-05",
    category: "Ganhos",
  },
  {
    id: "5",
    description: "Jantar em restaurante",
    amount: -65.3,
    date: "2023-06-03",
    category: "Comida",
  },
  {
    id: "6",
    description: "Conta de internet",
    amount: -59.99,
    date: "2023-06-02",
    category: "Utilidades",
  },
  {
    id: "7",
    description: "Ingressos de cinema",
    amount: -25.0,
    date: "2023-06-01",
    category: "Entretenimento",
  },
  {
    id: "8",
    description: "Posto de gasolina",
    amount: -45.75,
    date: "2023-05-30",
    category: "Transporte",
  },
  {
    id: "9",
    description: "Loja de roupas",
    amount: -89.99,
    date: "2023-05-28",
    category: "Comprinhas",
  },
  {
    id: "10",
    description: "Pagamento de dividendos",
    amount: 32.5,
    date: "2023-05-25",
    category: "Ganhos",
  },
];

export default function TransactionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Transactions</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/transactions/new">
                <Plus className="mr-1 h-4 w-4" />
                Nova transação
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar transações..."
                className="w-full pl-8"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo de transação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as transações</SelectItem>
                  <SelectItem value="income">Ganhos</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="food">Comida</SelectItem>
                  <SelectItem value="utilities">Utilidades</SelectItem>
                  <SelectItem value="transportation">Transporte</SelectItem>
                  <SelectItem value="entertainment">Entretenimento</SelectItem>
                  <SelectItem value="shopping">Comprinhas</SelectItem>
                  <SelectItem value="income">Ganhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {transaction.amount > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {transaction.amount > 0 ? "+" : "-"}R$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
