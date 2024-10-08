export interface IConfigurationBuilder {
    /**
     * Gets a key/value collection that can be used to share data between the {@link IConfigurationBuilder}
     * and the registered {@link IConfigurationSource}'s.
     */
    readonly properties: Map<string, unknown>;

    readonly sources: IConfigurationSource[];

    add(source: IConfigurationSource): this;
    build(): Promise<IConfigurationRoot>;
}

export interface IConfiguration {
    get(key: string): string | null;
    set(key: string, value: string | null): void;
    /**
     * Gets a configuration sub-section with the specified key.
     * @param key The key of the configuration section.
     * 
     * @remarks
     * 
     * This method will never return `null`. If no matching sub-section is found with the specified key, an empty {@link IConfigurationSection} will be returned.
     */
    getSection(key: string): IConfigurationSection;
    /**
     * Gets the immediate descendant configuration sub-sections.
     */
    getChildren(key?: string): IConfigurationSection[];
    getReloadToken(): unknown;
}

export interface IConfigurationRoot extends IConfiguration {
    /**
     * Gets the {@link IConfigurationProvider} providers for this configuration.
     */
    readonly providers: IConfigurationProvider[];

    /**
     * Forces the configuration values to be reloaded from the underlying {@link IConfigurationProvider} providers.
     */
    reload(): Promise<void>;
}

export interface IConfigurationSection extends IConfiguration {
    /**
     * Gets the key this section occupies in its parent.
     */
    readonly key: string;
    /**
     * Gets the full path to this section within the {@link IConfiguration}.
     */
    readonly path: string;

    value: string | null;
}

export interface IConfigurationProvider {
    get(key: string): string | null | undefined;
    set(key: string, value: string | null): void;
    /**
     * Returns the immediate descendant configuration keys for a given parent path based on the data of this
     * {@link IConfigurationProvider} and the set of keys returned by all the preceding
     * {@link IConfigurationProvider} providers.
     * 
     * @param earlierKeys The child keys returned by the preceding providers for the same parent path.
     * @param parentPath The parent path.
     */
    getChildKeys(earlierKeys: string[], parentPath?: string): string[];
    /**
     * Loads configuration values from the source represented by this {@link IConfigurationProvider}.
     */
    load(): Promise<void>;

    getReloadToken(): unknown;
}

export interface IConfigurationSource {
    build(builder: IConfigurationBuilder): Promise<IConfigurationProvider>;
}
