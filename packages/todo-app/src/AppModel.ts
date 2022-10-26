export interface JoinedColumnInfo {
    Name: string;
    DisplayName: string;
    Table: string;
    Joins: { Item1: string, Item2: string }[];
}

export interface RightDisplayInfo {
    Columns: string[];
    JoinedColumns: JoinedColumnInfo[];
}

export interface SpecificRightInfo {
    KeyColumnValue: string;
    DisplayValue1: string;
    DisplayValue2: string;
    DisplayValue3: string;
    ForUsers: boolean;
    UserCount?: number;
    RoleCount?: number;
    InternetAccess?: boolean;
}

export interface Right {
    Name: string;
    SchemaName: string;
    TableName: string;
    KeyColumnName: string;
    Description: string;
    DisplayInfo?: RightDisplayInfo;
    SpecificInfos?: SpecificRightInfo[];
}

export interface KeyColumnRights {
    rights: Right[];
    isExpanded: boolean;
    isSearchExpanded: boolean;
    searchResults?: Right[];
}

export interface TableRights {
    byColumn: _.Dictionary<KeyColumnRights>;
    isExpanded: boolean;
    isSearchExpanded: boolean;
    searchResultCount?: number;
}