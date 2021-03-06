// Copyright (C) 1998-2000 Greg J. Badros
// Use of this source code is governed by the LGPL, which can be found in the
// LGPLv2.1 file.
//
// Parts Copyright (C) 2011, Alex Rusell (slightlyoff@chromium.org)

sc_require('constraint');

(function(c) {
"use strict";

c.LinearConstraint = c.inherit({
  extends: c.Constraint,
  initialize: function(cle /*c.LinearExpression*/, 
                       strength /*c.Strength*/,
                       weight /*double*/) {
    c.Constraint.call(this, strength, weight);
    this.expression = cle;
  },
});


c.LinearInequality = c.inherit({
  extends: c.LinearConstraint,

  initialize: function(a1, a2, a3, a4, a5) {
    // FIXME(slightlyoff): what a disgusting mess. Should at least add docs.

    // console.log("c.LinearInequality.initialize(", a1, a2, a3, a4, a5, ")");
    if (a1 instanceof c.LinearExpression &&
        a3 instanceof c.AbstractVariable) {
      var cle = a1, op = a2, clv = a3, strength = a4, weight = a5;
      c.LinearConstraint.call(this, cle.clone(), strength, weight);
      if (op == c.LEQ) {
        this.expression.multiplyMe(-1);
        this.expression.addVariable(clv);
      } else if (op == c.GEQ) {
        this.expression.addVariable(clv, -1);
      } else {
        throw new c.InternalError("Invalid operator in ClLinearInequality constructor");
      }
    } else if (a1 instanceof c.LinearExpression) {
      return c.LinearConstraint.call(this, a1, a2, a3);
    } else if (a2 == c.GEQ) {
      c.LinearConstraint.call(this, new c.LinearExpression(a3), a4, a5);
      this.expression.multiplyMe(-1.0);
      this.expression.addVariable(a1);
    } else if (a2 == c.LEQ) {
      c.LinearConstraint.call(this, new c.LinearExpression(a3), a4, a5);
      this.expression.addVariable(a1,-1.0);
    } else {
      throw new ExCLInternalError("Invalid operator in ClLinearInequality constructor");
    }
  },

  isInequality: true,

  toString: function() {
    // return "c.LinearInequality: " + this.hashCode();
    return c.LinearConstraint.prototype.toString.call(this) + " >= 0 ) id: " + this.hash_code;
  },
});

var lc = c.LinearConstraint;

c.LinearEquation = c.inherit({
  extends: c.LinearConstraint,
  initialize: function(a1, a2, a3, a4) {
    // FIXME(slightlyoff): this is just a huge mess.
    if (a1 instanceof c.LinearExpression && !a2 || a2 instanceof c.Strength) {
      lc.call(this, a1, a2, a3);
    } else if ((a1 instanceof c.AbstractVariable) &&
               (a2 instanceof c.LinearExpression)) {
      var clv = a1, cle = a2, strength = a3, weight = a4;
      lc.call(this, cle, strength, weight);
      this.expression.addVariable(clv, -1);
    } else if ((a1 instanceof c.AbstractVariable) &&
               (typeof(a2) == 'number')) {
      var clv = a1, val = a2, strength = a3, weight = a4;
      lc.call(this, new c.LinearExpression(val), strength, weight);
      this.expression.addVariable(clv, -1);
    } else if ((a1 instanceof c.LinearExpression) &&
               (a2 instanceof c.AbstractVariable)) {
      var cle = a1, clv = a2, strength = a3, weight = a4;
      lc.call(this, cle.clone(), strength, weight);
      this.expression.addVariable(clv, -1);
    } else if (((a1 instanceof c.LinearExpression) || (a1 instanceof c.AbstractVariable) ||
                (typeof(a1) == 'number')) &&
               ((a2 instanceof c.LinearExpression) || (a2 instanceof c.AbstractVariable) ||
                (typeof(a2) == 'number'))) {
      if (a1 instanceof c.LinearExpression) {
        a1 = a1.clone();
      } else {
        a1 = new c.LinearExpression(a1);
      }
      if (a2 instanceof c.LinearExpression) {
        a2 = a2.clone();
      } else {
        a2 = new c.LinearExpression(a2);
      }
      lc.call(this, a1, a3, a4);
      this.expression.addExpression(a2, -1);
    } else {
      throw "Bad initializer to ClLinearEquation";
    }
    c.Assert(this.strength instanceof c.Strength, "_strength not set");
  },

  toString: function() {
    return lc.prototype.toString.call(this) + " = 0 )";
  },
});

})(c);
