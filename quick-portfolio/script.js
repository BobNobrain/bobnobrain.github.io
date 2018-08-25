function entry(title, icon, hash, repo, tags, images) {
    return {
        title,
        icon,
        hash,
        repo,
        tags,
        images
    };
}

const vm = new Vue({
    el: '#app',

    data() {
        return {
            current: 'vks',
            portfolio: [
                entry(
                    'Планировщик ВКС',
                    'event',
                    'vks',
                    false,
                    ['SPA', 'Frontend', 'Vue.js', 'Nuxt.js'],
                    ['vks1.png', 'vks2.png', 'vks3.png', 'vks4.png', 'vks5.png']
                ),

                entry(
                    'MusicBox',
                    'music_note',
                    'musicbox',
                    'IIpocTo/musicbox/',
                    ['SPA', 'Frontend', 'Vue.js', 'Nuxt.js', 'Учебный'],
                    ['mb1.png', 'mb2.png', 'mb3.png']
                ),

                entry(
                    'Luma Shop',
                    'shop',
                    'node-shop',
                    'BobNobrain/node-shop',
                    ['Frontend', 'Bootstrap', 'Backend', 'node.js', 'express.js', 'mysql', 'docker', 'Учебный'],
                    ['shop1.png', 'shop2.png', 'shop3.png']
                ),

                entry(
                    'Транслятор ASM',
                    'code',
                    'asm',
                    false,
                    [],
                    ['io1.png']
                ),

                entry(
                    'Обучающее приложение',
                    'school',
                    'mmfp',
                    'TITANY/mmfp',
                    ['Electron', 'Vue.js', 'Учебный'],
                    []
                )
            ]
        };
    },
    computed: {
        currentItem() {
            for (let i = 0; i < this.portfolio.length; i++) {
                const item = this.portfolio[i];
                if (item.hash === this.current) return item;
            }
            return null;
        }
    },

    mounted() {
        this.$vuetify.theme.primary = '#00BCD4';
    }
});
