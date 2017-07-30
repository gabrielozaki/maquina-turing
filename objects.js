var State = function(label){
    this.x = 0;
    this.y = 0;
    this.color = 'yellow';
    this.ray = 20;
    this.label = label
    //this.out_transitions = []; // tryng not to use them
    //this.in_transitions = []; // tryng not to use them
    this.transitions = [];
    this.initial = false;
    this.finaL = false;
};

State.prototype.setXY = function(x, y) {
    this.x = x;
    this.y = y;
};

State.prototype.getXY = function() {
    return{
        "x": this.x,
        "x": this.y
    }
};


var Link = function(prev, next){
    // property used to determine if the line is straight=0, curve top=1, curve bottom=2
    this.bridge = 0; 
    this.prev = prev;
    this.next = next;
    this.transicoes = [];
};


function Nota()
{
    this.text;//texto da nota atual
    this.posx, posy;//posição gráfica da nota atual
    this.width, height;//largura e altura gráfica da nota atual
    this.alpha;
    this.id; // id nota atual

    this.setId = function(_id)
    {
        this.id = _id;
    };

    this.getId = function()
    {
        return this.id;
    };

    this.setPosicao = function(x, y)
    {
        this.posx = x;
        this.posy = y;
    };

    this.setSize = function(w, h)
    {
        this.width = w;
        this.height = h;
    };

    this.getWidth = function()
    {
        return this.width;
    };

    this.getHeight = function()
    {
        return this.height;
    };

    this.setText = function(t)
    {
        this.text = t;
    }

    this.getText = function()
    {
        return this.text;
    };

    this.getPosX = function()
    {
        return this.posx;
    };

    this.getPosY = function()
    {
        return this.posy;
    };

    this.setTranslucent = function()
    {
        this.alpha = '.4';
    }

    this.setOpaque = function()
    {
        this.alpha = '1';
    }

    this.getAlpha = function()
    {
        return this.alpha;
    }
}


function Passo()
{
    this.estado;
    this.cadeia;

    this.setEstado = function(n_estado)
    {
        this.estado = n_estado;
    }

    this.getEstado = function()
    {
        return this.estado;
    }

    this.setCadeia = function(n_cadeia)
    {
        this.cadeia = n_cadeia;
    }

    this.getCadeia = function()
    {
        return this.cadeia;
    }
}


function Transicao()
{
    //classe para armazenar a transição de uma um automato finito


    this.texto_transicao;        //variável para armazenar a transição
    this.rect_x, rect_y, rect_width, rect_height;

    this.setTransicao = function(t)
    {
        this.texto_transicao = t;
    };
    
    this.setRect = function(x, y, width, height)
    {
        this.rect_x = x;
        this.rect_y = y;
        this.rect_width = width;
        this.rect_height = height;
    };

    this.getTransicao = function()
    {
        return this.texto_transicao;
    };

    this.getRectX = function()
    {
        return this.rect_x;
    };

    this.getRectY = function()
    {
        return this.rect_y;
    };  

    this.getRectWidth = function()
    {
        return this.rect_width;
    };  

    this.getRectHeight = function()
    {
        return this.rect_height;
    };  

}
