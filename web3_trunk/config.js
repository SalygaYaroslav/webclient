window.__web__ = {
    dev: true,
    version: '0.56',
    application_name: 'Простой Бизнес',
    width: 1200,
    height: $(window).height() > 680 ? 680 : $(window).height(),
    style: 'blue', //    current stylesheet
    base_server_url: 'https://agent.prostoy.ru',
    upload_server_url: 'https://agent.prostoy.ru/appendfilepart.php',
    timeout: 5000,
    file_url: 'file.prostoy.ru',
    onload: {
        'lang': {
            js: ['moment']
        },
        'template': {
            js: ['mustache.min'],
            css: ['theme']
        },
        'render': {},
        'xmlobject': {
            js: ['x2js']
        },
        'notice': {},
        'request': {},
        'tool': {
            css: ['flags'],
            js: ['custom.fn']
        },
        'interface': {
            ext: ['load'],
            css: ['interface', 'crcs', 'load']
        },
        'authorization': {
            ext: ['form', 'params'],
            css: ['auth'],
            js: ['cookie', 'md5'],
            req: true
        }
    },
    onstart: {
        'dataset': {
            cls: ['organization', 'project', 'user', 'group', 'task', 'category'],
            ext: ['tree'],
            js: ['storage'],
            req: true
        },
        'organization_block': {
            css: ['organization']
        },
        'user_block': {
            css: ['user_block']
        },
        'scene': {
            css: ['scene']
        },
        'router': {
            req: true
        },
        'bblock': {
            // cls: ['button'],
            css: ['bblock']
        },
        'elements': {
            css: ['elements']
        },
        'windows': {
            css: ['windows']
        },
        'tabs': {
            css: ['tabs']
        },
        'comments': {
            cls: ['comment'],
            css: ['simple_comment'],
            req: true
        },
        'list': {
            ext: ['comments', 'comments_find', 'organizations', 'projects', 'tasks', 'users', 'crm',
                'user_groups', 'categories', 'user_organization', 'contact_groups',
                'task_gateways'],
            req: true
        },
        'forms': {
            ext: ['comment.form', 'category.form', 'comment_move.form', 'comment_participants.form', 'comment_personal.form', 'send_mail_param.form'],
            css: ['comment', 'category', 'send_mail_param', 'comment_personal'],
            req: true
        },
        'table': {
            css: ['simple']
        },
        'tree': {},
        'viewer': {
            css: ['viewer']
        },
        'upload': {
            js: ['sparkMd5'],
            css: ['button']
        },
        'treeform': {
            cls: ['treeform.form', 'treeform.section', 'treeform.string', 'treeform.select', 'treeform.date', 'treeform.avatar', 'treeform.checkbox', 'treeform.file', 'treeform.image', 'treeform.html'],
            css: ['tform'],
            ext: ['treeform.format', 'treeform.options', 'treeform.validate']
        },
        'chat': {
            cls: ['chat.user', 'chat.window', 'chat.message'],
            js: ['strophe', 'sha1', 'strophe.archive', 'strophe.chatstates', 'strophe.disco', 'strophe.disco', 'strophe.muc', 'strophe.ping', 'strophe.receipts', 'strophe.roster', 'strophe.rsm', 'strophe.vcard'],
            css: ['chat']
        },
        'crm': {
            cls: ['table', 'structure', 'row', 'edit_structure'],
            ext: ['tool'],
            css: ['crm'],
            req: true
        },
        'database': {}
    }
};
