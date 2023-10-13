const usePageStore = defineStore(
    'room', {
        state: () => ({
            dataLayout: {},
            vmLayout: {},

            LayoutForm1: {},
            LayoutForm2: {},

            dataThree: {},
            vmThree: {},
            threeApp: {},

            dataTopRight: {},

            dataPreview: {},
            vmPreview: {},

            // dataThreeView: {},
            // vmThreeView: {},
            // threeAppView: {},
        }),
        actions: {
            destroyObject(object) {}
        }
    }
);

export default usePageStore;