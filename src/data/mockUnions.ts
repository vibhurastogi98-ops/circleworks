export interface Union {
  id: string;
  name: string;
  abbreviation: string;
  status: "Active" | "Inactive";
  color: string;
}

export const mockUnionsList: Union[] = [
  {
    id: "u-001",
    name: "Screen Actors Guild – American Federation of Television and Radio Artists",
    abbreviation: "SAG-AFTRA",
    status: "Active",
    color: "#6366F1",
  },
  {
    id: "u-002",
    name: "International Alliance of Theatrical Stage Employees",
    abbreviation: "IATSE",
    status: "Active",
    color: "#0EA5E9",
  },
  {
    id: "u-003",
    name: "Writers Guild of America",
    abbreviation: "WGA",
    status: "Active",
    color: "#F59E0B",
  },
  {
    id: "u-004",
    name: "Directors Guild of America",
    abbreviation: "DGA",
    status: "Active",
    color: "#EF4444",
  },
];
