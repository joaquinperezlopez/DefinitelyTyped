// Type definitions for @keystonejs/keystone 7.0
// Project: https://github.com/keystonejs/keystone
// Definitions by: Kevin Brown <https://github.com/thekevinbrown>
//                 Timothee Clain <https://github.com/tclain>
//                 Abhijith Vijayan <https://github.com/abhijithvijayan>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.5

// Because this is a scoped package, without this line Typescript doesn't associate the
// types with the right package.
// tslint:disable-next-line:no-single-declare-module
declare module '@keystonejs/keystone' {
    import { RequestHandler } from 'express';
    import { GraphQLFieldResolver } from 'graphql';
    import { FieldType, AutoIncrement, CalendarDay } from '@keystonejs/fields';

    type KeyValues<Keys extends string = any, Values = any> = { [key in Keys]: Values };

    class BaseKeystoneAdapter {}
    class BaseAuthStrategy {}
    class BaseApp {
        build(args?: { distDir: string; keystone: Keystone }): void | Promise<void>;
    }

    interface KeystoneOptions {
        adapter: BaseKeystoneAdapter;
        adapters?: {
            [key: string]: BaseKeystoneAdapter;
        } | undefined;
        appVersion?: {
            version?: string | undefined,
            addVersionToHttpHeaders?: boolean | undefined,
            access?: unknown | undefined,
        } | undefined;
        cookie?: {
            secure?: boolean | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | undefined;
        } | undefined;
        cookieSecret?: string | undefined;
        defaultAccess?: {
            list?: boolean | undefined,
            field?: boolean | undefined,
            custom?: boolean | undefined
        } | undefined;
        defaultAdapter?: string | undefined;
        onConnect?: (() => void) | undefined;
        queryLimits?: {
            maxTotalResults?: number | undefined;
        } | undefined;
        sessionStore?: any; // TODO: bring in express session types
        schemaNames?: string[] | undefined;
    }

    interface KeystonePrepareResult {
        middlewares: RequestHandler[];
    }

    interface AuthenticationContext {
        authentication: {
            item: {
                id: string;
                name: string;
                email: string;
                isAdmin: boolean;
                password: string;
            };
            listAuthKey: string;
            operation: string;
            originalInput?: any; // TODO: types
            gqlName: string;
            itemId?: any; // TODO: types
            itemIds?: any; // TODO: types
        };
    }

    interface GraphQLWhereClause {
        [field: string]: any; // TODO: Can we make this generic?
    }

    type AccessCallback = (context: AuthenticationContext) => boolean | GraphQLWhereClause;

    type Access =
        | boolean // Shorthand documented here: https://www.keystonejs.com/api/access-control#booleans
        | AccessCallback
        | {
              read?: boolean | GraphQLWhereClause | AccessCallback | undefined;
              update?: boolean | AccessCallback | undefined;
              create?: boolean | AccessCallback | undefined;
              delete?: boolean | AccessCallback | undefined;
              auth?: boolean | undefined;
          };

    type Plugin = any; // TODO: investigate what a plugin is

    interface ResolveInputHooksOptions<Record extends {} = any> {
        resolvedData: any;
        originalInput: any; // todo: check
        existingItem: Record;
        updatedItem: Record;
        context: any; // TODO: use apollo context
        addFieldValidationError: (error: string) => any; // not clear in the documentation
        list: {
            query: (args: any, context: any, options?: { skipAccessControl: boolean }) => Promise<Record>;
            queryMany: (args: any, context: any, options?: { skipAccessControl: boolean }) => Promise<Record[]>;
            queryManyMeta: (
                args: any,
                context: any,
                options?: { skipAccessControl: boolean },
            ) => Promise<{ count: number }>;
            getList: (key: string) => ResolveInputHooksOptions['list']; // TODO: create a List Object and returns it
        };
    }

    type Hooks = Partial<{
        resolveInput: (opts: Omit<ResolveInputHooksOptions, 'addFieldValidationError' | 'updatedItem'>) => any; // TODO: return the same shape as resolvedData
        validateInput: (opts: Omit<ResolveInputHooksOptions, 'updatedItem'>) => void;
        beforeChange: (opts: Omit<ResolveInputHooksOptions, 'addFieldValidationError'>) => void;
        afterChange: (
            opts: Pick<ResolveInputHooksOptions, 'updatedItem' | 'existingItem' | 'originalInput' | 'context' | 'list'>,
        ) => void;
        beforeDelete: (opts: Pick<ResolveInputHooksOptions, 'existingItem' | 'context' | 'list'>) => void;
        validateDelete: (
            opts: Pick<ResolveInputHooksOptions, 'existingItem' | 'context' | 'list' | 'addFieldValidationError'>,
        ) => void;
        afterDelete: (opts: Pick<ResolveInputHooksOptions, 'existingItem' | 'context' | 'list'>) => void;
    }>;

    /**
     * Lists
     */
    type DefaultValueFunction = () => any;

    interface BaseFieldOptions {
        type: FieldType;
        schemaDoc?: string | undefined;
        defaultValue?: boolean | DefaultValueFunction | undefined;
        isRequired?: boolean | undefined;
        isUnique?: boolean | undefined;
        hooks?: Hooks | undefined;
        access?: Access | undefined;
        label?: string | undefined;
    }

    interface AutoIncrementOptions extends BaseFieldOptions {
        gqlType?: 'Int' | 'ID' | undefined;
    }

    interface CalendarDayOptions extends BaseFieldOptions {
        format?: string | undefined;
        yearRangeFrom?: number | undefined;
        yearRangeTo?: number | undefined;
        yearPickerType?: string | undefined;
    }

    interface ContentOptions extends BaseFieldOptions {
        blocks: any[]; // FIXME: describe the type of block using https://www.keystonejs.com/keystonejs/field-content/
    }
    interface DateTimeOptions extends CalendarDayOptions {
        knexOptions: any; // FIXME: provide a more precise type from the knex adaptor
    }
    interface FileOptions extends BaseFieldOptions {
        route?: string | undefined;
        adapter?: any; // FIXME: provide a file adapter type
    }

    interface LocationOptions extends BaseFieldOptions {
        googleMapsKey: string;
    }

    interface OEmbedOptions extends BaseFieldOptions {
        adapter: any; // FIXME: use eombed adapters type
    }

    interface PasswordOptions extends BaseFieldOptions {
        minLength: number;
        rejectCommon: boolean;
        workFactor: number;
    }

    interface RelationshipOptions extends BaseFieldOptions {
        // TODO: add a more type safe solution if possible
        ref: string;
        many: boolean;
    }
    interface SelectOptions extends BaseFieldOptions {
        // TODO: use a named type
        options: string | string[] | Array<{ value: string; label: string }>;
    }
    interface SlugOptions<FieldNames extends string> extends BaseFieldOptions {
        from: string;
        // TODO: resolved data is of the same type as the current object list. Investigate if we can at least provide the available keys via a generic.
        generate: (opts: { resolvedData: KeyValues<FieldNames> }) => string;
    }

    interface UnsplashOptions extends BaseFieldOptions {
        accessKey: string;
        secretKey: string;
    }
    interface UuidOptions extends BaseFieldOptions {
        // do we have other possible values here ?
        caseTo: 'upper' | 'lower';
    }

    type AllFieldsOptions<FieldNames extends string = string> =
        | BaseFieldOptions
        | AutoIncrementOptions
        | CalendarDayOptions
        | ContentOptions
        | DateTimeOptions
        | FileOptions
        | LocationOptions
        | OEmbedOptions
        | PasswordOptions
        | RelationshipOptions
        | SelectOptions
        | SlugOptions<FieldNames>
        | UnsplashOptions
        | UuidOptions;

    /** Hooks */
    interface ListSchema<Fields extends string = string> {
        fields: { [fieldName in Fields]: AllFieldsOptions };
        listAdapterClass?: any; // TODO: investigate if a specific type can be provided
        schemaDoc?: string | undefined;
        access?: Access | undefined;
        plugins?: Plugin[] | undefined;
        hooks?: Hooks | undefined;
    }

    interface GraphQLExtension<Source = any, Context = any> {
        schema: string;
        resolver: GraphQLFieldResolver<Source, Context>;
        access?: Access | undefined;
    }

    interface GraphQLExtensionSchema {
        types?: Array<{ type: string }> | undefined;
        queries?: GraphQLExtension[] | undefined;
        mutations?: GraphQLExtension[] | undefined;
    }

    class Keystone<ListNames extends string = string> {
        constructor(options: KeystoneOptions);

        connect(): Promise<void>;
        createAuthStrategy(options: { type: BaseAuthStrategy; list: ListNames; config?: any; hooks?: any; plugins?: any[] | undefined }): any; // TODO
        createList(name: string, schema: ListSchema): void;
        disconnect(): Promise<void>;
        extendGraphQLSchema(schema: GraphQLExtensionSchema): void;
        prepare(options: {
            apps?: BaseApp[] | undefined;
            cors?: {
                origin?: boolean | undefined;
                credentials?: boolean | undefined
            } | undefined,
            dev?: boolean | undefined,
            distDir?: string | undefined,
            pinoOptions?: any
        }): Promise<KeystonePrepareResult>;

        // eslint-disable-next-line no-unnecessary-generics
        createContext<Context = any>(context: { schemaName?: string | undefined, authentication?: AuthenticationContext | undefined, skipAccessControl?: boolean | undefined; }): Context;
        // The return type is actually important info here. I don't believe this generic is unnecessary.
        // eslint-disable-next-line no-unnecessary-generics
        executeGraphQL<Output = any>(options: {context?: any; query?: any, variables?: any}): Output;
    }
}
